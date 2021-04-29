# Local development Docker infrastructure

## What

The files in this directory allow you to locally build and run a test 
deployment of the PDP equivalent to the production deployment.

## Why

1. We are currently running PDP in an antiquated environment (including
Python 2.7) which 
is difficult if not impossible to reproduce on an up-to-date dev machine. 
Plus it messes up your machine. Docker containers to the rescue.

1. We could let the GitHub Docker publishing action create a new docker image
for us each time we commit a change, but that is slow, consumes a lot 
resources unnecessarily (including limited Dockerhub pulls), 
and requires a public commit before you may be ready to commit. 

1. Instead we can build and run locally.

## How

#### 0. Advance prep

1. Update `docker/dev-local/fe_deployment.env` and 
   `docker/dev-local/be_deployment.env` with correct passwords for the `
    pcic_meta` and `crmp` databases.
1. Update  `docker/dev-local/pgbounce_users.txt` with correct md5 sums.
1. Edit your `/etc/hosts` and add `pdp.localhost` to the line starting
   with `127.0.0.1`. The result will look like 
   ```
   127.0.0.1       localhost pdp.localhost
   ```
   This allows the reverse proxy automatically set up by the docker-compose
   to refer to the domain `pdp.localhost`. Note that the frontend container is 
   configured with `APP_ROOT` and `DATA_ROOT` using this domain.

#### 1. Build the dev local image

The image need only be (re)built when:

1. the project is first cloned, or
1. any of the `*requirements.txt` files change, or
1. `entrypoint.sh` changes.

The built image contains all dependencies specified in those files 
(but not the PDP codebase).
It forms the basis for installing and running your local codebase.

To build the image:

```
docker-compose -f docker/dev-local/docker-compose.yaml build
```

Image build can take several minutes.

#### 2. Start the containers

```
docker-compose -f docker/dev-local/docker-compose.yaml up -d
```

This starts containers for the backend, frontend, pgbouncer, and a local
reverse proxy that maps the HTTP addresses `pdp.localhost:5000` onto the
appropriate containers (mainly to avoid CORS problems).

You need only be concerned with the frontend and backend containers.

#### 3. Connect to frontend and backend containers and start the servers

When the containers are running, you can execute commands inside them
with `docker exec`.
In this case we execute the command (`gunicorn`) that runs the server.

1. Start the backend:
   ```
    docker exec -d pdp_backend-dev \
      gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend
   ```
1. Start the frontend:
   ```
    docker exec -d pdp_frontend-dev \
      gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend
   ```

Note that the server started must match the container name.

#### 4. Point your browser at `pdp.localhost:5000/portal/<name>/map/`

This should load the named PDP portal.

#### 4. Change your code

Since your local codebase is mounted to the containers and installed in 
editable/development mode (`pip install -e .`), any
code changes you make externally (in your local filesystem) are reflected 
"live" inside the containers.

#### 5. Restart server (Python code changes)

If you change only JavaScript code (or other items under `pdp/static`),
then to see the effects you can skip this step.

If you change Python code, you will have to stop and restart the appropriate
server (frontend or backend; you have to decide which depending on the code
you changed). 

If you're not sure or can't be bothered to determine it,
you can stop and restart both backend and frontend:


```
docker-compose -f docker/dev-local/docker-compose.yaml down
docker-compose -f docker/dev-local/docker-compose.yaml up -d
docker exec -d pdp_backend-dev \
  gunicorn --reload --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend
docker exec -d pdp_frontend-dev \
  gunicorn --reload --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend
```

To restart the backend only:

```
docker stop pdp_backend-dev
docker rm $_
docker-compose -f docker/dev-local/docker-compose.yaml up -d backend
docker exec -d pdp_backend-dev \
  gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend
```

To restart the frontend only:

```
docker stop pdp_frontend-dev
docker rm $_
docker-compose -f docker/dev-local/docker-compose.yaml up -d frontend
docker exec -d pdp_frontend-dev \
  gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend
```

#### 5. Refresh browser

You may need to clear caches to ensure you get a fresh copy of changed code
or data.

#### 6. Stop the containers when you're done

When you have completed a cycle of development and testing, you may wish
to stop the Docker containers.

```
docker-compose -f docker/dev-local/docker-compose.yaml down
```

#### 7. Extra: Run an interactive bash shell inside a container

When the containers are running, you can poke around inside them and/or
execute tests inside them by connecting to them interactively. 
In order to do this:

```
docker exec -it <container> bash
```

This starts a bash shell inside the container and connects you to it.
You should see a command prompt like:

```
root@e320e9c22200:~/pdp# 
```

Again, since your local codebase is mounted to the containers and installed in 
editable/development mode (`pip install -e .`), any
code changes you make are reflected "live" inside the container, 
and so you may modify code externally and run the tests inside the container.

TODO: Figure out why tests are trying to import from `/codebase` rather than
from `/root/pdp`, or else use workdir `/codebase`. Geez.

## Notes

1. Data files need only be mounted to the *backend* service.
1. Oh yeah, you'll need to mount the gluster `/storage` volume to locally to
   `/storage` so that those data files are accessible.
1. JS configuration files need only be mounted to the *frontend* service. 
   An example one is included in this directory, and mounted. It overrides
   the default one in the project.

## Troubleshooting

- If you are getting a `client_login_timeout()` error message connecting to 
the database or error messages while building the local Docker image, your 
VPN may be interfering with Docker's networking. Try OpenConnect VPN 
instead of AnyConnect, if applicable.
