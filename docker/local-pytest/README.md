# this package docker local (py)test environment

## What

The files in this directory allow you to build and run a test environment
for this package equivalent to that in the GitHub Actions CI. Within this 
environment you can run part or all of the test suite, or do other dev/debug 
activities.

## Why

1. We are currently running CI tests in an antiquated environment (including
Python 2.7) which 
is difficult if not impossible to reproduce on an up-to-date dev machine. 
Plus it messes up your machine. Docker containers to the rescue.

1. We could just let the CI do the work, but it can take from 2 to 5 minutes
to run a single test ... most of that consumed by setting up the docker 
container for the test run.

1. So let's just build that environment once, run it interactively, 
run our tests from inside there, and wow zippy. Debugging now feasible.

## How

1. The image is built with all the contents necessary to install and run the
package and its tests. 

1. But since we want to run our own, local test code, we can't install this package 
from a repo. Instead we install from our local codebase when the container is 
started.

1. To facilitate this, we set up a working diretory (WORKDIR) in the image
called `/codebase`. 

1. When we run the image, we must mount our local codebase to `/codebase`.
(See Run image).

1. When the container starts (image runs), the script 
`entrypoint.sh` installs the local version of this package 
(in development mode `-e`). It also sets up 
and `su`s a non-root user, `test`, because PostgreSQL refuses -- sensibly --
to run as the root user, which is what we are up to this point.

1. Because we have mounted our codebase to the
container, when we make changes to it (outside the container), those changes
are available inside the container, and vice-versa. Therefore we can use all
our local tools outside the container as normal (which is a shedload easier
than trying to install your IDE inside the container :) ).

1. The vice-versa has a downside, which is that runs of the tests leave
behind a set "orphaned" pytest caches which will cause the next
run of the image to fail if they are not cleaned up first with `py3clean`.
We don't, however mount the codebase read-only because we might want 
some effects of the test runs to be written to our external filesystem 
(e.g., redirected output).

## Notes and caveats

1. Writing to a mounted volume from inside a docker container involves some
tricky permissions logic that I don't fully understand yet. Known:
    - If the user inside the container has the same user id 
    (numeric, e.g., 1000) as the owner of the mounted file or directory outside 
    the container, then it is possible to write to the mounted volume 
    (e.g., to redirect output from a test run to a file). 
    - If the user id's differ, a permissions error is raised and the write 
    fails.
    - Default user id (of the first user) on a Linux system is 1000.
    My own user id (rglover) is 1000. Hence the setting of user id 1000
    in `entrypoint.sh`. If your user id is not 1000, you will need to change
    this if you wish to write content from inside the container.
    - This is a hack and should be cleaned up so it works
    generally. That will require some research into Docker's mechanisms for
    mapping user ids between a container and its run environment, not for the
    fainthearted. 

1. As noted above, running tests in the test container in read/write mode 
leaves problematic pycache junk behind in the host filesystem. 
This can be cleaned up by running `py3clean`.

## Pull image

The GitHub Action docker-publish automatically builds the image.
Pull it from Dockerhub:

```
docker pull pcic/pdp-local-pytest
```

## Run image (container)

Run it from the project root directory:

```
py3clean .
./docker/local-pytest/up-backend.sh
```

When the container starts, it installs the local codebase as described above.
After that, you are in interactive mode, in a bash shell, so you can issue 
commands, such as `py.test ....` as normal.

Leave the container running for as long as you want. You can do multiple
rounds of modification and testing using a single container, without
restarting (which was the justification for creating it).

## Build image (manual)

Since this image is built automatically by the GitHub Action docker-publish,
you should not need to do this. However, just in case:

From the _project root directory_ (important Docker context location):

```
docker build -t pcic/this package-local-pytest -f docker/local-test/Dockerfile .
```
