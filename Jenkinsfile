@Library('pcic-pipeline-library@1.0.1')_


node {
    stage('Code Collection') {
        collectCode()
    }

    stage('Python Test Suite') {
        def pyImage = 'pcic/geospatial-python'
        def requirements = ['requirements.txt', 'test_requirements.txt',
                            'deploy_requirements.txt']
        def pytestArgs = '-m crmpdb -v --tb=short tests'
        def options = [pythonVersion: 2, aptPackages: ['git'], buildDocs: true,
                       containerData: 'pdp']

        runPythonTestSuite(pyImage, requirements, pytestArgs, options)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
