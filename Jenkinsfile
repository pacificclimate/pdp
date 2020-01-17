@Library('pcic-pipeline-library')_


node {
    stage('Code Collection') {
        collectCode()
    }

    stage('Node Test Suite') {
        runNodeTestSuite('node', 'test')
    }

    stage('Python Test Suite') {
        def pyImage = 'pcic/geospatial-python'
        def requirements = ['requirements.txt', 'test_requirements.txt',
                            'deploy_requirements.txt']
        def pytestArgs = '-vv --tb=short tests'
        def options = [pythonVersion: 2, aptPackages: ['git'], buildDocs: true,
                       containerData: 'pdp']

        runPythonTestSuite(pyImage, requirements, pytestArgs, options)
    }

    stage('Clean Workspace') {
        cleanWs()
    }

    stage('Recollect Code') {
        collectCode()
    }

    def image
    def imageName

    stage('Build Image') {
        (image, imageName) = buildDockerImage('pdp')
    }

    stage('Publish Image') {
        publishDockerImage(image, 'PCIC_DOCKERHUB_CREDS')
    }

    if(BRANCH_NAME.contains('PR')) {
        stage('Security Scan') {
            writeFile file: 'anchore_images', text: imageName
            anchore name: 'anchore_images', engineRetries: '700'
        }
    }

    stage('Clean Local Image') {
        removeDockerImage(imageName)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
