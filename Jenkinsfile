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

    stage('Build Image') {
        String image_name = 'pdp-test-feature-jenkins-support'
        String branch_name = BRANCH_NAME.toLowerCase()

        // Update image name if we are not on the master branch
        if (branch_name != 'master') {
            image_name = image_name + '/' + branch_name
        }

        withDockerServer([uri: PCIC_DOCKER]) {
            def image = docker.build(image_name)
        }
    }
}
