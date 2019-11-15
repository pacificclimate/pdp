node {
    stage('Code Collection') {
        checkout scm
    }
    nodejs('node') {
        stage('NPM Installation') {
            sh 'npm install'
        }
        stage('NPM Test Suite') {
            sh 'npm run test'
        }
    }

    withDockerServer([uri: PCIC_DOCKER]) {
        // Use image with gdal already installed
        def gdalenv = docker.image('pcic/geospatial-python')

        gdalenv.inside('-u root --volumes-from pdp_data --env-file /storage/data/projects/comp_support/jenkins/pdp_envs/pdp_deployment.env') {
            stage('Git Executable Install') {
                sh 'apt-get update'
                sh 'apt-get install -y git'
            }

            stage('Python Installs') {
                withEnv(['PIP_INDEX_URL=https://pypi.pacificclimate.org/simple']) {
                    sh 'pip install -i https://pypi.pacificclimate.org/simple/ -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt'
                    sh 'pip install -e .'
                }
            }

            stage('Build Docs') {
                sh 'python setup.py install'
                sh 'python setup.py build_sphinx'
                sh 'python setup.py install'
            }

            stage('Python Test Suite') {
                sh 'py.test -vv --tb=short tests'
            }
        }
    }

    stage('Clean Workspace') {
        cleanWs()
    }

    stage('Recollect Code') {
        checkout scm
    }

    def image
    String name = BASE_REGISTRY + 'pdp'

    // tag branch
    if (BRANCH_NAME == 'master') {
        // TODO: detect tags and releases for master
    } else {
        name = name + ':' + BRANCH_NAME
    }

    stage('Build and Publish Image') {
        withDockerServer([uri: PCIC_DOCKER]) {
            image = docker.build(name)

            docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
                image.push()
            }
        }
    }

    stage('Security Scan') {
        writeFile file: 'anchore_images', text: name
        anchore name: 'anchore_images', engineRetries: '700'
    }

    stage('Clean Up Local Image') {
        withDockerServer([uri: PCIC_DOCKER]){
            sh "docker rmi ${name}"
        }
    }
}
