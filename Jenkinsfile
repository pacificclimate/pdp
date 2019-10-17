pipeline{
    agent any
    stages{
        stage("Building Docker Image"){
            steps{
               sh "docker build . -t pdp:latest"
            }
        }
    }
}
