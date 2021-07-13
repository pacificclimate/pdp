# Deployment

The sections below detail how to deploy the `pdp`.

- [Deployment](#deployment)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
      - [Config Items](#config-items)
    - [JavaScript Configuration Code](#javascript-configuration-code)
  - [Deploying](#deploying)
    - [Development](#development)
    - [Local development Docker infrastructure](#local-development-docker-infrastructure)
      - [What](#what)
      - [Why](#why)
      - [How](#how)
      - [Notes](#notes)
      - [Troubleshooting](#troubleshooting)
    - [Production](#production)
      - [Gunicorn](#gunicorn)
      - [Supervisord](#supervisord)

## Configuration

Configuration of the PDP is accomplished through two mechanisms:
- For server-side configuration and very simple client-side configuration (such as the URL of the ncWMS service), a set of environment variables.
- For more complex client-side app configuration, configuration code in JavaScript files, at most one file per portal.

### Environment Variables

A sample environment file is stored in `pdp/config.env`. This environment file can be sourced in before you run the pdp, included in a Docker deployment or used in any other flexible way.

```bash
source pdp/config.env
export $(grep -v '^#' pdp/config.env | cut -d= -f1)
```

#### Config Items

| Name | Description | 
| ---- | ----------- |
| `app_root` | Root location where data portal will be exposed. This location will need to be proxied to whatever port the server will be running on. |
| `data_root` | Root location of backend data server. Probably `<app_root>/data`. If you are running in production, this location will need to be proxied to whatever port the data server will be running on. When running a development server, this is redirected internally. |
| `dsn` | Raster metadata database url of the form `dialect[+driver]://username:password@host:port/database`. Password must either be supplied or available in the user's `~/.pgpass` file. |
| `pcds_dsn` | PCDS database URL of the form `dialect[+driver]://username:password@host:port/database`. Password must either be supplied or available in the user's `~/.pgpass` file. |
| `js_min` | Determine's use of javascript bundling/minification. |
| `geoserver_url` | PCDS Geoserver URL |
| `ncwms_url` | Raster portal ncWMS URL |
| `tilecache_url` | Tileserver URLs (space separated list) for base maps |
| `use_analytics` | Enable or disable Google Analytics reporting |
| `analytics` | Google Analytics ID |

### JavaScript Configuration Code

Some portals are configured by hard-coded values in the client app JavaScript. Other portals are configured a separate JS configuration file that exports a configuration object processed by the client app.

A separate configuration file can easily be superseded by mounting a volume to its file path that contains different configuration content. In the Docker container, such files have internal (target) file paths of the form `/root/pdp/pdp/static/js/<portal>_config.js`; for example, `/root/pdp/pdp/static/js/prism_demo_config.js`. Note the doubled `pdp` subdirectories.

Developers are **strongly encouraged** to keep the JS configuration files in this repo up to date with the most recently deployed configurations. When a configuration is changed for deployment, the repo copy of the configuration file should also be changed appropriately. A new release need not be made right away (that is of course the point of separate configuration), but eventually updates will make their way into releases, and we will also have a typical or standard configurations that are easily accessible.

At present, the following JS portal configuration files exist:
- PRISM: `pdp/static/js/prism_demo_config.js`

## Deploying

### Development

Provided you installed everything with `tox`, you should be able to run a development server as follows:

First set up the environment variables that do not default to usable values. Obtain the user ID's and passwords necessary for the two databases from PCIC IT. We typically use port 8000 but any port will do.

```bash
export DSN=postgresql://<USER>:<PASSWORD>@db3.pcic.uvic.ca/pcic_meta
export DATA_ROOT=http://127.0.0.1:<PORT>/data
export PCDS_DSN=postgresql://<USER>:<PASSWORD>@db3.pcic.uvic.ca/crmp
export APP_ROOT=http://127.0.0.1:<PORT>
```

Run the server:

```bash
devenv/bin/python scripts/rast_serve.py -p <PORT> [-t]
```

### Local development Docker infrastructure

#### What

The files in `docker/dev-local` allow you to locally build and run a test deployment of the PDP equivalent to the production deployment.

#### Why

1. We are currently running PDP in an antiquated environment (including Python 2.7) which is difficult if not impossible to reproduce on an up-to-date dev machine. Plus it messes up your machine. Docker containers to the rescue.

1. We could let the GitHub Docker publishing action create a new docker image for us each time we commit a change, but that is slow, consumes a lot resources unnecessarily (including limited Dockerhub pulls), and requires a public commit before you may be ready to commit. 

1. Instead we can build and run locally.

#### How

***0 - Advance prep***

1. Update `docker/dev-local/fe_deployment.env` and `docker/dev-local/be_deployment.env` with correct passwords for the `pcic_meta` and `crmp` databases.
1. Update  `docker/dev-local/pgbounce_users.txt` with correct md5 sums.
2. Edit your `/etc/hosts` and add `pdp.localhost` to the line starting with `127.0.0.1`. The result will look like 
```
127.0.0.1       localhost pdp.localhost
```
This allows the reverse proxy automatically set up by the docker-compose to refer to the domain `pdp.localhost`. Note that the frontend container is configured with `APP_ROOT` and `DATA_ROOT` using this domain.

***1 - Build the dev local image***

The image need only be (re)built when:

1. the project is first cloned, or
2. any of the `*requirements.txt` files change, or
3. `entrypoint.sh` changes.

The built image contains all dependencies specified in those files (but not the PDP codebase). It forms the basis for installing and running your local codebase.

To build the image:

```
docker-compose -f docker/dev-local/docker-compose.yaml build
```

Image build can take several minutes.

***2 - Start the containers***

```
docker-compose -f docker/dev-local/docker-compose.yaml up -d
```

This starts containers for the backend, frontend, pgbouncer, and a local reverse proxy that maps the HTTP addresses `pdp.localhost:5000` onto the appropriate containers (mainly to avoid CORS problems).

You need only be concerned with the frontend and backend containers.

***3 - Connect to frontend and backend containers and start the servers***

When the containers are running, you can execute commands inside them with `docker exec`. In this case we execute the command (`gunicorn`) that runs the server.

1. Start the backend:
   ```
    docker exec -d pdp_backend-dev \
      gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:backend
   ```
2. Start the frontend:
   ```
    docker exec -d pdp_frontend-dev \
      gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf pdp.wsgi:frontend
   ```

Note that the server started must match the container name.

***4 - Point your browser at `pdp.localhost:5000/portal/<name>/map/`***

This should load the named PDP portal.

***5 - Change your code***

Since your local codebase is mounted to the containers and installed in editable/development mode (`pip install -e .`), any code changes you make externally (in your local filesystem) are reflected "live" inside the containers.

***6 - Restart server (Python code changes)***

If you change only JavaScript code (or other items under `pdp/static`), then to see the effects you can skip this step.

If you change Python code, you will have to stop and restart the appropriate server (frontend or backend; you have to decide which depending on the code you changed). 

If you're not sure or can't be bothered to determine it, you can stop and restart both backend and frontend:


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

***7 - Refresh browser***

You may need to clear caches to ensure you get a fresh copy of changed code or data.

***8 - Stop the containers when you're done***

When you have completed a cycle of development and testing, you may wish to stop the Docker containers.

```
docker-compose -f docker/dev-local/docker-compose.yaml down
```

***9 - Extra: Run an interactive bash shell inside a container***

When the containers are running, you can poke around inside them and/or execute tests inside them by connecting to them interactively. In order to do this:

```
docker exec -it <container> bash
```

This starts a bash shell inside the container and connects you to it. You should see a command prompt like:

```
root@e320e9c22200:~/pdp# 
```

Again, since your local codebase is mounted to the containers and installed in editable/development mode (`pip install -e .`), any code changes you make are eflected "live" inside the container, and so you may modify code externally and run the tests inside the container.

TODO: Figure out why tests are trying to import from `/codebase` rather than from `/root/pdp`, or else use workdir `/codebase`. Geez.

#### Notes

1. Data files need only be mounted to the *backend* service.
1. Oh yeah, you'll need to mount the gluster `/storage` volume to locally to `/storage` so that those data files are accessible.
1. JS configuration files need only be mounted to the *frontend* service. An example one is included in this directory, and mounted. It overrides the default one in the project.

#### Troubleshooting

- If you are getting a `client_login_timeout()` error message connecting to the database or error messages while building the local Docker image, your VPN may be interfering with Docker's networking. Try OpenConnect VPN instead of AnyConnect, if applicable.


### Production

A production install should be run in a production ready WSGI container with proper process monitoring. We use [gunicorn](http://gunicorn.org/) as the WSGI container, [Supervisord](http://supervisord.org/) for process monitoring, and [Apache](http://httpd.apache.org/) as a reverse proxy.

In production, the frontend and backend are ran in seperate WSGI containers. This is because the front end serves short, non-blocking requests, whereas the back end serves fewer long, process blocking requests.

#### Gunicorn

Running in gunicorn can be tested with a command similar to the following:

```bash
pyenv/bin/gunicorn -b 0.0.0.0:<port1> pdp.wsgi:frontend
pyenv/bin/gunicorn -b 0.0.0.0:<port2> pdp.wsgi:backend
```

#### Supervisord

*Note: this is only an **example** process monitoring setup. Details can and will be different depending on your particular deployment stragety*

Set up the Supervisord config file using
```bash
pyenv/bin/echo_supervisord_conf > /install/location/supervisord.conf
```

In order to run Supervisord, the config file must have a `[supervisord]` section. Here's a sample section:

```ini
[supervisord]
logfile=/install/location/etc/<supervisord_logfile>      ; (main log file;default $CWD/supervisord.log)
loglevel=info     ; (log level;default info; others: debug,warn,trace)
nodaemon=true     ; (start in foreground if true; useful for debugging)
```

Supervisorctl is a command line utility that lets you see the status and output of processes and start, stop and restart them. The following will set up supervisorctl using a unix socket file, but it is also possible to monitor processes using a web interface if you wish to do so.

```ini
[unix_http_server]
file = /tmp/supervisord.sock

[supervisorctl]
serverurl = unix:///tmp/supervisord.sock

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
```

Front end config

```ini
[program:pdp_frontend-v.v.v]
command=/install/location/pyenv/bin/gunicorn -b 0.0.0.0:<port> --access-logfile=<access_logfile> --error-logfile=<error_logfile> pdp.wsgi:frontend
directory=/install/location/
user=www-data
environment=OPTION0="",OPTION2=""...
autostart=true
autorestart=true
redirect_stderr=True
killasgroup=True
```

Back end config

```ini
[program:pdp_backend-v.v.v]
command=/install/location/pyenv/bin/gunicorn -b 0.0.0.0:<port> --workers 10 --worker-class gevent -t 3600 --access-logfile=<access_logfile> --error-logfile=<error_logfile> pdp.wsgi:backend
directory=/install/location/
user=www-data
environment=OPTION0="",OPTION2=""...
autostart=true
autorestart=true
redirect_stderr=True
killasgroup=True
```

To make starting/stop easier, add a group to `supervisord.conf`

```ini
[group:v.v.v]
programs=pdp_frontend-v.v.v,pdp_backend-v.v.v
```

Once the config file has been set up, start the processes with the following command:

```bash
pyenv/bin/supervisord -c path/to/supervisord.conf
```

After invoking Supervisord, use supervisorctl to monitor and update the running processes

```bash
pyenv/bin/supervisorctl
```

When upgrading, it's easiest to simply copy the existing config and update the paths/version number.

**IMPORTANT**: When adding a new version, make sure to set the old version `autostart` and `autorestart` to false.

Using `supervisorctl`, you should then be able to `reread` the new config, `update` the old version config (so it stops, picks up new autostart/autorestart=false), and `update` the new version.

If there are any errors, they can be found in the `supervisord_logfile`. Errors starting gunicorn can be found in the `error_logfile`.