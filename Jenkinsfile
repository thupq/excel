node('') {
    stage 'Checkout'
        checkout scm
    stage 'Build'
        sh "npm install"
        sh "docker build -t easy-be2:local-latest -f Dockerfile ."
    stage 'Deploy'
//         sh "docker-compose -f compose-file.yaml down -v"
        sh "docker-compose -f compose-file.yaml up -d"
    stage "Remove Image"
        sh "chmod +x ./removedocker.sh"
        sh "./removedocker.sh"
}
