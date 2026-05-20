pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'suchith141' // Update if your Docker ID changed on this machine
        IMAGE_NAME      = 'todo-list-app'
        IMAGE_TAG       = "${BUILD_NUMBER}"
    }
    
    tools {
        nodejs "node" // Make sure the NodeJS plugin is installed on this laptop too!
    }

    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }

        stage('Dependency Check') {
            steps {
                // Dependency check step works across platforms automatically
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: 'DP-Check'
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    // Using 'bat' for Windows, and pointing to npx for safety
                    bat "npx sonar-scanner -Dsonar.projectKey=todo-list -Dsonar.sources=."
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                // 'bat' command handles the local Docker execution on Windows cleanly
                bat "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    // Windows friendly secure pipeline login format
                    bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                    bat "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
    }
}