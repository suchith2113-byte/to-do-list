pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER   = 'suchith141'
        IMAGE_NAME        = 'todo-list-app'
        IMAGE_TAG         = "${BUILD_NUMBER}" 
        _JAVA_OPTIONS     = "-Xms256m -Xmx512m"
        
        // 🚀 VERCEL CONFIGURATION
        // Replace these with your actual Vercel project and organization IDs
        VERCEL_ORG_ID     = 'prj_gZIA5AGD2d3X5KFlWwnDZbKDqYHe'
        VERCEL_PROJECT_ID = 'team_Fe5X8EwtGMw9UGgfEw0Z11l2'
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
                bat "docker build -t %DOCKER_HUB_USER%/%IMAGE_NAME%:%IMAGE_TAG% ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    bat "echo %DOCKER_HUB_PASSWORD% | docker login -u %DOCKER_HUB_USERNAME% --password-stdin"
                    bat "docker push %DOCKER_HUB_USER%/%IMAGE_NAME%:%IMAGE_TAG%"
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                    // Installs Vercel CLI locally for this build run and pushes to production instantly
                    bat "npm install --global vercel"
                    bat "vercel --token %VERCEL_TOKEN% --prod --yes"
                }
            }
        }
    }
}