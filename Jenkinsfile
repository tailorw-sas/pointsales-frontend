@Library(['PullRequestInfo', 'emailNotification']) _
import com.tailorwsas.notificaciones.NotificadorEmail

pipeline {
    
    agent any

    environment {
        SISTEMA = 'PointSales'
        GITHUB_REPO = 'pointsales-frontend'
        GIT_TOKEN = "${env.GITHUB_TOKEN}"
        SRC = 'pointsales-admin'
        ORIGIN_BRANCH_NAME = "${env.GIT_BRANCH}"
        DOCKER_IMAGE_NAME = 'tailorw/pointsales-admin:version'
        DOCKER_CREDENTIALS = 'Tailorw-DockerCredentials'
        NAMESPACE = 'pointsales'
        K3S_CREDENTIALS = 'KubernetesCredential-env'
        YAML = 'pointsales-admin.yaml'
        DEPLOYMENT_NAME = 'pointsales-admin'
        URL_DEV = credentials("URL-K3S-dev")
        URL_QA = credentials("URL-K3S-qa")
        EMAIL_FROM = "${env.CORREO_ORIGEN}"
        ESTADO_OK = 'OK'
        ESTADO_ERROR = 'ERROR'
    }
    
    triggers {
        githubPush()
    }
    
    stages {

        stage ('Init') {
            steps {
                echo 'Initializing variables...'
                script {   
                    def branch = env.ORIGIN_BRANCH_NAME.replace('origin/', '')
                    env.BRANCH_NAME = branch

                    def dockerImage = env.DOCKER_IMAGE_NAME.replace('version', env.BRANCH_NAME)
                    env.DOCKER_IMAGE = dockerImage

                    def k3sCredentials = env.K3S_CREDENTIALS.replace('env', env.BRANCH_NAME)
                    env.SERVER_K3S_CREDENTIALS = k3sCredentials

                    echo 'Variables:'
                    echo "env.SISTEMA: ${env.SISTEMA}"
                    echo "env.GITHUB_REPO: ${env.GITHUB_REPO}"
                    echo "env.GIT_COMMIT: ${env.GIT_COMMIT}"
                    echo "env.GIT_TOKEN: ${env.GIT_TOKEN}"
                    try{
                        def prInfo = pullrequests.getPullRequestInfoByGitCommit(env.SISTEMA, env.GITHUB_REPO, env.GIT_COMMIT, env.GIT_TOKEN)
                        env.PR_TITLE = prInfo.title
                        env.PR_AUTHOR = prInfo.author
                        env.EMAIL_AUTHOR = prInfo.authorEmail
		    } catch (Exception e) {
                        // Manejo del error
                        echo "Error al obtener información del pull request: ${e.message}"
                        echo "Stack trace: ${e}"
                        env.PR_TITLE = "Unknown"
                        env.PR_AUTHOR = "Unknown"
                        env.EMAIL_AUTHOR = "admin@tailorw.com"
                    }
                    			
                    if(env.BRANCH_NAME == 'dev'){
                        env.SERVER_K3S_URL = env.URL_DEV
                        env.EMAIL_LIST = env.EMAIL_LIST_DEV_POINTSALES_FRONTEND
                    }
                    if(env.BRANCH_NAME == 'qa'){
                        env.SERVER_K3S_URL = env.URL_QA
                        env.EMAIL_LIST = env.EMAIL_LIST_QA
                    }
                    

                }
            }
        }

        stage ('Create docker image'){
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
                withDockerRegistry(credentialsId: "${DOCKER_CREDENTIALS}", url: "") {
                    sh 'docker push $DOCKER_IMAGE'
                }
            }
        }

        stage ('Publish to Kubernetes') {
            steps {
                withKubeConfig(credentialsId: "${SERVER_K3S_CREDENTIALS}", namespace: "${NAMESPACE}", restrictKubeConfigAccess: false, serverUrl: "${SERVER_K3S_URL}") {
                    sh 'kubectl apply -f kubernetes/$YAML'
                    //sh 'kubectl rollout restart deploy $DEPLOYMENT_NAME'
                }
            }
        }
    }
	
	post {
        success {
            script {
                def notificator = new NotificadorEmail(this)
                notificator.sendEmail(env.EMAIL_AUTHOR, env.EMAIL_LIST, env.EMAIL_FROM, env.SRC, env.SISTEMA, env.BRANCH_NAME, env.ESTADO_OK, env.PR_TITLE, env.PR_AUTHOR)
            }
        }
        failure {
            script {
                def notificator = new NotificadorEmail(this)
                notificator.sendEmail(env.EMAIL_AUTHOR, env.EMAIL_LIST, env.EMAIL_FROM, env.SRC, env.SISTEMA, env.BRANCH_NAME, env.ESTADO_ERROR, env.PR_TITLE, env.PR_AUTHOR)
            }
        }
    }
}
