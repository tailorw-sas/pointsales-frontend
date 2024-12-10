import type { MenuHeader } from '~/types'

export const menuItems: MenuHeader[] = [
  {
    label: 'Administración',
    icon: 'pi pi-cog',
    items: [
      {
        label: 'Módulos',
        icon: 'pi pi-fw pi-users',
        to: '/modules',
        perm: 'ADMINISTRACION:GESTION-MODULOS'
      },
      {
        label: 'Permisos',
        icon: 'pi pi-fw pi-wrench',
        to: '/permissions',
        perm: 'ADMINISTRACION:GESTION-PERMISOS'
      },
      {
        label: 'Empresa',
        icon: 'pi pi-fw pi-microsoft',
        to: '/business',
        perm: 'ADMINISTRACION:GESTION-EMPRESAS'
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-fw pi-user',
        to: '/user',
        perm: 'ADMINISTRACION:GESTION-USUARIOS'
      },
      // {
      //   label: 'Clientes',
      //   icon: 'pi pi-fw pi-user-plus',
      //   to: '/customers'
      // },
      {
        label: 'Publicidad',
        icon: 'pi pi-fw pi-user-plus',
        to: '/advertising',
        perm: 'ADMINISTRACION:GESTION-PUBLICIDAD'
      },
      {
        label: 'Mailjet',
        icon: 'pi pi-fw pi-envelope',
        items: [
          {
            label: 'Configuración',
            icon: 'pi pi-fw pi-cog',
            to: '/mailjet-config',
            perm: 'ADMINISTRACION:GESTION-MAILJET'
          },
          {
            label: 'Plantillas',
            icon: 'pi pi-fw pi-send',
            to: '/mailjet-template',
            perm: 'ADMINISTRACION:GESTION-MAILJET'
          },
          {
            label: 'Campañas',
            icon: 'pi pi-fw pi-at',
            to: '/mailjet-campaign',
            perm: 'ADMINISTRACION:GESTION-MAILJET'
          },
        ]
      },
      {
        label: 'Reporte',
        icon: 'pi pi-fw pi-user-plus',
        items: [
          {
            label: 'Conexión a Base de Datos',
            icon: 'pi pi-fw pi-user-plus',
            to: '/db-connection',
          },
          {
            label: 'Config de Reporte',
            icon: 'pi pi-fw pi-user-plus',
            to: '/report-config',
            perm: 'ADMINISTRACION:GESTION-REPORTE'
          },

        ]
      },
    ]
  }

]
