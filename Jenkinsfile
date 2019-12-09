/**
 * Install required software then run test suite
 */
def run_tests() {
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
                    sh 'pip install -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt'
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
}


/**
 * Build a docker image given the name
 *
 * @param image_name the name of the image
 * @return image the built docker image
 */
def build_image(image_name) {
    def image
    withDockerServer([uri: PCIC_DOCKER]) {
        image = docker.build(image_name, '--pull .')
    }

    return image
}

/**
 * Get the original branch name.
 *
 * In the case where a branch has been filed as a PR the `BRANCH_NAME`
 * environment varible updates from `some-branch-name` to `PR-[pull request #]`.
 * To keep image tagging consistent on Docker Hub we want to use the original
 * name.
 *
 * @return name the name of the branch
 */
def get_branch_name() {
    String name
    if (BRANCH_NAME.contains('PR')) {
        name = CHANGE_BRANCH
    } else {
        name = BRANCH_NAME
    }

    return name
}


/**
 * If the master branch has been tagged we also add the `latest` tag.  Otherwise
 * we just use the branch name as the tag.
 *
 * @return tags a list of the tags for the image
 */
def get_tags() {
    String tag = sh (script: 'git tag --contains', returnStdout: true).trim()

    def tags = []
    if(BRANCH_NAME == 'master' && !tag.isEmpty()) {
        // It is possible for a commit to have multiple git tags. We want to
        // ensure we add all of them in.
        tags.addAll(tag.split('\n'))
        tags.add('latest')
    } else {
        String branch_name = get_branch_name()
        tags.add(branch_name)
    }

    return tags
}


/**
 * Given an image publish it with a tag to the PCIC docker registry.
 *
 * @param image to publish
 * @return tag to use later in the security scan
 */
def publish_image(image) {
    def tags = get_tags()

    withDockerServer([uri: PCIC_DOCKER]){
        docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
            tags.each { tag ->
                image.push(tag)
            }
        }
    }

    return tags
}


/**
 * Clean up image on dev01
 *
 * @param image_name name of the image to clean up
 */
def clean_local_image(image_name) {
    withDockerServer([uri: PCIC_DOCKER]){
        sh "docker rmi ${image_name}"
    }
}


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

    // Run test suite
    run_tests()

    stage('Clean Workspace') {
        cleanWs()
    }

    stage('Recollect Code') {
        checkout scm
        sh 'git fetch'
    }

    // Define image items
    def image_name = BASE_REGISTRY + 'pdp'
    def image
    def published_tags
    String scan_name

    stage('Build Image') {
        image = build_image(image_name)
    }

    stage('Publish Image') {
        published_tags = publish_image(image)
    }

    // Only conduct security scan on branches filed as pull requests
    if(BRANCH_NAME.contains('PR')) {
        stage('Security Scan') {
            // Use one of our published tags to identify the image to be scanned
            scan_name = image_name + ':' + published_tags[0]

            writeFile file: 'anchore_images', text: scan_name
            anchore name: 'anchore_images', engineRetries: '700'
        }
    }

    stage('Clean Local Image') {
        clean_local_image(image_name)
    }

    stage('Clean Workspace') {
        cleanWs()
    }
}
