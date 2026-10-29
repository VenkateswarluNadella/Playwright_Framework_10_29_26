pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')
  }

  tools {
    nodejs 'NodeJS-20'
  }

  stages {
    stage('Install dependencies') {
      steps {
        bat 'npm ci'
        bat 'npx playwright install chromium'
      }
    }

    stage('Type check') {
      steps {
        bat 'npm run typecheck'
      }
    }

    stage('BDD and Playwright tests') {
      steps {
        bat 'npm run test:all'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/**,screenshots/**,traces/**,videos/**', allowEmptyArchive: true
      junit testResults: 'reports/**/*.xml', allowEmptyResults: true
    }
  }
}
