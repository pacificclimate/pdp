all: options

options:
	@echo "Welcome to the pdp! You can \`make <option>\` with the options below, happy coding!:"
	@echo "    local-build ------------ Build the local-pytest image"
	@echo "    local-up --------------- Bring up the local-pytest container"
	@echo "    local-down ------------- Take down the local-pytest container"
	@echo "    dev-build -------------- Build dev-local image"
	@echo "    dev-up ----------------- Up and connect pdp containers"
	@echo "    dev-restart ------------ Restart dev-local"
	@echo "    dev-restart-backend ---- Restart dev-local backend only"
	@echo "    dev-restart-frontend --- Restart dev-local frontend only"
	@echo "    dev-stop --------------- Stop all dev-local containers"

local-build:
	docker build -t pcic/pdp-local-pytest -f docker/local-pytest/Dockerfile .

local-up:
	py3clean .
	./docker/local-pytest/up-backend.sh

local-down:
	./docker/local-pytest/down-backend.sh

dev-build:
	docker-compose -f docker/dev-local/docker-compose.yaml build

dev-up:
	docker-compose -f docker/dev-local/docker-compose.yaml up -d
	docker exec -d pdp_backend-dev gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend
	docker exec -d pdp_frontend-dev gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend

dev-restart:
	docker-compose -f docker/dev-local/docker-compose.yaml down
	docker-compose -f docker/dev-local/docker-compose.yaml up -d
	docker exec -d pdp_backend-dev gunicorn --reload --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend
	docker exec -d pdp_frontend-dev gunicorn --reload --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend

dev-restart-backend:
	docker stop pdp_backend-dev
	docker rm $_
	docker-compose -f docker/dev-local/docker-compose.yaml up -d backend
	docker exec -d pdp_backend-dev gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend

dev-restart-frontend:
	docker stop pdp_frontend-dev
	docker rm $_
	docker-compose -f docker/dev-local/docker-compose.yaml up -d frontend
	docker exec -d pdp_frontend-dev gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend

dev-stop:
	docker-compose -f docker/dev-local/docker-compose.yaml down