import CredentialsProvider from 'next-auth/providers/credentials'
import { optional, z } from 'zod'
import { jwtDecode } from 'jwt-decode'
import { NuxtAuthHandler } from '#auth'
import { helpers } from '@/server/utils/helpers'

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(refreshToken: any) {
  try {
    const refreshedTokens = await $fetch<{
      data: {
        'scope': string
        'access_token': string
        'expires_in': number
        'refresh_expires_in': number
        'refresh_token': string
        'token_type': string
        'not-before-policy': number
        'session_state': string
      }
    } | null>(`${process.env.VITE_APP_BASE_URL}/identity/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        refreshToken: refreshToken.refresh_token,
      },
    })
    if (!refreshedTokens || !refreshedTokens.data) {
      throw refreshedTokens
    }

    return {
      ...refreshToken,
      access_token: refreshedTokens.data.access_token,
      accessTokenExpires: Date.now() + 1000 * refreshedTokens.data.expires_in,
      refresh_token: refreshedTokens.data.refresh_token,
      refreshTokenExpires: Date.now() + 1000 * refreshedTokens.data.refresh_expires_in,
    }
  }
  catch (error) {
    return {
      ...refreshToken,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        const loginSchema = z.object({
          username: z.string(),
          password: z.string().min(1),
        })

        const aux = helpers()
        const isHuman = await aux.verifyRecaptchaToken(credentials.tokenCaptcha)

        if (!isHuman) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Error verificando captcha',
          })
        }

        const result = loginSchema.safeParse(credentials)
        if (!result.success) {
          return null
        }

        const { username, password } = result.data

        try {
          const userResponse = await $fetch<{
            scope: string
            access_token: string
            expires_in: number
            refresh_expires_in: number
            refresh_token: string
            token_type: string
            session_state: string
          }>(`${process.env.VITE_APP_BASE_URL}/identity/api/auth/authenticate`, {
            method: 'POST',
            body: {
              username,
              password
            }
          })

          const { access_token, expires_in, refresh_token, refresh_expires_in } = userResponse
          const authorization = `Bearer ${access_token}`
          const userMeResponse: any = await $fetch(`${process.env.VITE_APP_BASE_URL}/identity/api/users/me`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authorization
            }
          })

          const { data: userData } = userMeResponse
          const decodedToken = jwtDecode(access_token)
          const isAdmin = (decodedToken as any).realm_access?.roles?.includes('ADMIN') || false

          const user = {
            access_token,
            accessTokenExpires: Date.now() + 1000 * expires_in,
            refresh_token,
            refreshTokenExpires: Date.now() + 1000 * refresh_expires_in,
            userId: userData.userId,
            userName: userData.userName,
            email: userData.email,
            name: userData.name,
            lastName: userData.lastName,
            image: userData.image,
            isAdmin,
          }

          return user
        }
        catch (error: any) {
          throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusCode === 428 ? 'Se requiere cambio de contraseña' : 'El nombre de usuario o la contraseña son incorrectos',
          })
        }
      },

    }),
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // Callback when the JWT is created / updated, see https://next-auth.js.org/configuration/callbacks#jwt-callback
    jwt: async ({ token, user, account }) => {
      if (account && user) {
        return {
          ...token,
          userId: (user as any).userId,
          access_token: (user as any).access_token,
          refresh_token: (user as any).refresh_token,
          accessTokenExpires: (user as any).accessTokenExpires,
          refreshTokenExpires: (user as any).refreshTokenExpires,
          isAdmin: (user as any).isAdmin,
        }
      }

      // Handle token refresh before it expires of 15 minutes
      if (token.refreshTokenExpires && Date.now() > (token as any).refreshTokenExpires) {
        console.error('Refresh token expired')
        // TODO: Add refresh token logic
        return null
      }

      if (token.accessTokenExpires && Date.now() > (token as any).accessTokenExpires) {
        return refreshAccessToken(token)
      }

      return token
    },
    // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        ...{
          userId: (token as any).userId,
          isAdmin: (token as any).isAdmin
        }
      }
      return session
    },
  }
})
