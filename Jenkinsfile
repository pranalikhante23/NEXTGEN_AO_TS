pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps chromium'
            }
        }

        stage('Run Intentional Office Tests') {
            steps {
                sh 'npm run test:insights'
            }
        }
    }
}
