pipeline {
    agent any

    tools {
        nodejs 'NodeJS-16'
    }

    environment {
        NPM_REGISTRY = 'https://registry.npmjs.org/'
        APP_NAME = 'mon-application-nodejs'
        APP_VERSION = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/babsmane/payment-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        npm ci --silent
                    '''
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    sh '''
                        npm run lint || echo "Linting failed but continuing..."
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    sh '''
                        npm test -- --coverage --watchAll=false
                    '''
                }
            }
            post {
                always {
                    junit 'reports/**/*.xml' // Rapport de tests JUnit
                    script {
                       if (fileExists('coverage/lcov-report/index.html')) {
                           publishHTML([
                               reportDir: 'coverage/lcov-report',
                               reportFiles: 'index.html',
                               reportName: 'Code Coverage Report',
                               allowMissing: false,
                               alwaysLinkToLastBuild: true,
                               keepAll: false
                           ])
                       } else {
                            echo "⚠️ Rapport de couverture non trouvé - Publication HTML ignorée"

                             publishHTML([
                                 reportDir: 'coverage/lcov-report',
                                 reportFiles: 'index.html',
                                 reportName: 'Code Coverage Report',
                                 allowMissing: true,  // Évite l'échec si fichier manquant
                                 alwaysLinkToLastBuild: false,
                                  keepAll: false
                             ])
                       }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    sh '''
                        npm run build
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        npm audit --production
                    '''
                }
            }
        }

        stage('Docker Build & Push') {
            when {
                branch 'main' // Uniquement sur la branche principale
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        def appImage = docker.build("${APP_NAME}:${APP_VERSION}")
                        appImage.push()
                        appImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        echo "Déploiement vers l'environnement de production..."
                        # Ajoutez vos commandes de déploiement ici
                        # Exemple avec kubectl, ssh, ansible, etc.
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs() // Nettoyer l'espace de travail
            echo 'Pipeline terminé'
        }
        success {
            echo 'Pipeline exécuté avec succès!'
            // Notifications Slack/Email
            slackSend(
                color: 'good',
                message: "✅ Déploiement réussi: ${APP_NAME} v${APP_VERSION}"
            )
        }
        failure {
            echo 'Pipeline échoué!'
            slackSend(
                color: 'danger',
                message: "❌ Déploiement échoué: ${APP_NAME} v${APP_VERSION}"
            )
        }
    }
}
