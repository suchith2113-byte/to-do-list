pipeline {
    agent any
    
    environment {
        // 1. Updated user variable name to match your friend's repository target
        DOCKER_HUB_USER = 'edith777'
        IMAGE_NAME      = 'todo-list-app'
        IMAGE_TAG       = "${BUILD_NUMBER}" 
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
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: 'DP-Check'
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    bat "npx sonar-scanner -Dsonar.projectKey=todo-list -Dsonar.sources=. -Dsonar.javascript.node.maxspace=2048"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                // 🛠️ FIXED: Changed Linux variables to Windows %VARIABLES% inside the bat block
                bat "docker build -t %DOCKER_HUB_USER%/%IMAGE_NAME%:%IMAGE_TAG% ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                    // 🛠️ FIXED: Changed Linux variables to Windows %VARIABLES% inside the bat block
                    bat "docker push %DOCKER_HUB_USER%/%IMAGE_NAME%:%IMAGE_TAG%"
                }
            }
        }
    }
}