pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'snnehahaa'
        IMAGE_NAME      = 'todo-list-app'
        IMAGE_TAG       = "${BUILD_NUMBER}"
        // 💡 This forces all background Java sub-processes to restrict their memory usage!
        _JAVA_OPTIONS   = "-Xms256m -Xmx512m"
    }

    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }

        stage('Dependency Check') {
            steps {
                // Added a parameter to tell dependency check to use minimal heap size
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: 'DP-Check'
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    // Added custom JVM flags directly to the scanner execution
                    bat "npx sonar-scanner -Dsonar.projectKey=todo-list -Dsonar.sources=. -Dsonar.javascript.node.maxspace=512"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                    bat "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
    }
}