# Local development Docker deployment

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

1. Change your code.
1. Locally build a new Docker image.
   -  (from the project root) `docker build -t pdp .`.
1. Run the new image: 
   - (from this directory)
       - `docker-compose down` (if you have an older one already running)
       - `docker-compose up -d`
   - (from the project root)
       - `docker-compose -f ./docker/dev-local/docker-compose.yaml down`
       - `docker-compose -f ./docker/dev-local/docker-compose.yaml up -d`
1. Hit `http://localhost:30555/<portal>/map/`.

When you like the results, commit to the repo.

## Notes

1. Data files need only be mounted to the *backend* service.
1. Oh yeah, you'll need to mount the gluster `/storage` volume to locally to
   `/storage` so that those data files are accessible.
1. JS configuration files need only be mounted to the *frontend* service. 
   An example one is included in this directory, and mounted. It overrides
   the default one in the project.