pipeline {
    agent any
    
    // 🛠️ AUTOMATICALLY PROVISION TOOLS ON YOUR MAC
    tools {
        nodejs 'node'
        sonarScanner 'Sonar-Scanner'
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
                    // 🍏 FIXED: Changed 'bat' to 'sh' and used Unix variable syntax for Mac
                    sh "sonar-scanner -Dsonar.projectKey=todo-list -Dsonar.sources=. -Dsonar.javascript.node.maxspace=2048"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                // 🍏 FIXED: Changed 'bat' to 'sh' and fixed variables for Mac environment
                sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    // 🍏 FIXED: Standardized to 'sh' for macOS execution
                    sh "echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                    // Because Node is explicitly loaded via tools, we can run npm safely
                    sh "npm install --global vercel"
                    sh "vercel --token ${VERCEL_TOKEN} --prod --yes"
                }
            }
        }
    }
}