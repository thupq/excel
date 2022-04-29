docker build -t easy-be2:local-latest -f Dockerfile_evn .

docker-compose -f compose-file.yaml down -v

docker-compose -f compose-file.yaml up -d
