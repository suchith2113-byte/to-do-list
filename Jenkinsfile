pipeline {
    agent any
    
    // 🛠️ AUTOMATICALLY PROVISION TOOLS ON YOUR MAC
    tools {
        nodejs 'node'
        sonarRunner 'Sonar-Scanner' // ✅ FIXED: Changed to the required identifier name
    }
    
    environment {
        DOCKER_HUB_USER   = 'suchith141'
        IMAGE_NAME        = 'todo-list-app'
        IMAGE_TAG         = "${BUILD_NUMBER}" 
        _JAVA_OPTIONS     = "-Xms256m -Xmx512m"
        
        VERCEL_ORG_ID     = 'team_Fe5X8EwtGMw9UGgfEw0Z11l2'
        VERCEL_PROJECT_ID = 'prj_gZIA5AGD2d3X5KFlWwnDZbKDqYHe'
    }

    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Code Analysis') {
            steps {
                // 'SonarQube-Server' must match the name in Manage Jenkins -> System -> SonarQube servers
                withSonarQubeEnv('SonarQube-Server') {
                    sh "sonar-scanner -Dsonar.projectKey=todo-list -Dsonar.sources=. -Dsonar.javascript.node.maxspace=2048"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    sh "echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                    sh "npm install --global vercel"
                    sh "vercel --token ${VERCEL_TOKEN} --prod --yes"
                }
            }
        }
    }
}