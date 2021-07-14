# Tests

The sections below detail how to run the test suite.

- [Tests](#tests)
  - [Docker Local (py)test Environment](#docker-local-pytest-environment)
    - [TL;DR: Brief instructions](#tldr-brief-instructions)
    - [What](#what)
    - [Why](#why)
    - [Mechanism](#mechanism)
    - [Instructions](#instructions)
    - [Notes and caveats](#notes-and-caveats)
  - [Node.js (tests of JS code)](#nodejs-tests-of-js-code)
  - [Portal-specific tests](#portal-specific-tests)
    - [Backend Mocks For Portal-specific tests](#backend-mocks-for-portal-specific-tests)
      - [getCatalog](#getcatalog)
      - [getRasterAccordionData](#getrasteraccordiondata)
      - [getMetadata](#getmetadata)
      - [getNcwmLayerDDS](#getncwmlayerdds)
      - [getNcwmsLayerDAS](#getncwmslayerdas)
    - [ncWMS Mocks For Portal-Specific tests](#ncwms-mocks-for-portal-specific-tests)
      - [getNCWMSLayerCapabilities](#getncwmslayercapabilities)

## Docker Local (py)test Environment

### TL;DR: Brief instructions

For greater detail, see section Instructions below.

1. Pull the image 

   `docker pull pcic/pdp-local-pytest:<tag>`
   
   where `<tag>` either `latest` or your branch name, the latter only if you modified the Dockerfile in `local-pytest`. You may only rarely need to pull a new copy of the image.
   
1. Run the container: `./docker/local-pytest/up-backend.sh`. The container will start, install your local version of the project, and give you a bash command line prompt.
    
1. Run your tests, etc.: In the running container, enter commands at the prompt, e.g., `py.test ...`.
   
1. Stop the container: When you no longer wish the container to be running, enter `ctrl+D` or `exit` at the container command line prompt. 
   
   If you detached from the image, you can enter `./docker/local-pytest/down-backend.sh` to stop and remove the container.

### What

The files in `docker/local-pytest` allow you to build and run a test environment for this package equivalent to that in the GitHub Actions CI. Within this environment you can run part or all of the test suite, or do other dev/debug activities.

### Why

1. We are currently running CI tests in an antiquated environment (including Python 2.7) which is difficult if not impossible to reproduce on an up-to-date dev machine. Plus it messes up your machine. Docker containers to the rescue.

1. We could just let the CI do the work, but it can take from 2 to 5 minutes to run a single test ... most of that consumed by setting up the docker container for the test run.

1. So let's just build that environment once, run it interactively, run our tests from inside there, and wow zippy. Debugging now feasible.

### Mechanism

1. The image is built with all the contents necessary to install and run the package and its tests. 

1. But since we want to run our own, local test code, we can't install this package from a repo. Instead we install from our local codebase when the container is  started.

1. To facilitate this, we set up a working diretory (WORKDIR) in the image called `/codebase`. 

1. When we run the image, we must mount our local codebase to `/codebase`. (See Run image).

1. When the container starts (image runs), the script `entrypoint.sh` installs the local version of this package (in development mode `-e`). It also sets up and `su`s a non-root user, `test`, because PostgreSQL refuses -- sensibly -- to run as the root user, which is what we are up to this point.

1. Because we have mounted our codebase to the container, when we make changes to it (outside the container), those changes are available inside the container, and vice-versa. Therefore we can use all our local tools outside the container as normal (which is a shedload easier than trying to install your IDE inside the container :) ).

1. The vice-versa has a downside, which is that runs of the tests leave behind a set "orphaned" pytest caches which will cause the next run of the image to fail if they are not cleaned up first with `py3clean`. We don't, however mount the codebase read-only because we might want some effects of the test runs to be written to our external filesystem (e.g., redirected output).

### Instructions

***Pull image***

The GitHub Action docker-publish automatically builds the image. Pull it from Dockerhub:

```
docker pull pcic/pdp-local-pytest:<tag>
```

If you are working on a branch, then `<tag>` will be your branch name.

***Run image (container)***

1. Update `docker/local-pytest/up-backend.sh` with the <tag> if necessary.

2. Run it from the project root directory.

    ```
    py3clean .
    ./docker/local-pytest/up-backend.sh
    ```

When the container starts, it installs the local codebase as described above. After that, you are in interactive mode, in a bash shell, so you can issue commands, such as `py.test ....` as normal.

Leave the container running for as long as you want. You can do multiple rounds of modification and testing using a single container, without restarting (which was the justification for creating it).

***Build image (manual)***

Since this image is built automatically by the GitHub Action docker-publish, you should not need to do this. However, just in case:

From the _project root directory_ (important Docker context location):

```
docker build -t pcic/pdp-local-pytest -f docker/local-pytest/Dockerfile .
```

### Notes and caveats

1. Writing to a mounted volume from inside a docker container involves some tricky permissions logic that I don't fully understand yet. Known:
    - If the user inside the container has the same user id (numeric, e.g., 1000) as the owner of the mounted file or directory outside the container, then it is possible to write to the mounted volume (e.g., to redirect output from a test run to a file).
    - If the user id's differ, a permissions error is raised and the write fails.
    - Default user id (of the first user) on a Linux system is 1000. My own user id (rglover) is 1000. Hence the setting of user id 1000 in `entrypoint.sh`. If your user id is not 1000, you will need to change this if you wish to write content from inside the container.
    - This is a hack and should be cleaned up so it works generally. That will require some research into Docker's mechanisms for mapping user ids between a container and its run environment, not for the fainthearted. 

2. As noted above, running tests in the test container in read/write mode leaves problematic pycache junk behind in the host filesystem. This can be cleaned up by running `py3clean`.


## Node.js (tests of JS code)

All JS tests are found in the directory `pdp/static/js/__test__`.

No configuration is required to run the Node.js tests. Simply:

```bash
npm run test
```

## Portal-specific tests

When each portal is instantiated, it loads its default dataset, which can be found in the javascript code for each portal. In order to completely and correctly load a dataset (and therefore entire portal for testing), the front end will make several queries to data services, all of which must be mocked with information for that particular dataset.

Please note that the testing harness does not set `url_base`, and portals instantiated for testing purposes have a `$(location).href` value of `http://localhost/`. This means that portals with an "archive" functionality that display two different sets of data but otherwise behave identically depending on the URL used to access them will always determine, using `pdp_controls.isArchivePortal()`, that they are *not* currently displaying the archived data, because the word "archive" is not present in their self-perceived URL when instantiated by tests. Therefore, they will load the non-archive choice when loading their default dataset for testing, and that is the dataset that needs to be mocked. Portals that currently have "archive" functionality:
* `vic_app`
* `canada_ex_app`

### Backend Mocks For Portal-specific tests
#### getCatalog
A mockup of the backend's `catalog.json`. JSON object with {`unique_id`: `data_url`} entries. The data urls should use the `data_root` set in `app-test-helper.js`. The default dataset needs to have an entry, but does not need to be the only entry.

#### getRasterAccordionData
A mockup of the backend's `menu.json`. JSON Object with portal-specific organization of datasets. The default dataset needs to be represented, but does not need to be the only entry.

#### getMetadata
A mockup if the backend's `metadata.json`. JSON object with `units`, `max`, and `min` attributes for the default dataset.

#### getNcwmLayerDDS
A mockup of a pyDAP DDS call. Needs to match the `time` metadata for the default dataset.

#### getNcwmsLayerDAS
A mockup of a pyDAP DAS call. Probably needs to include `lat`, `lon`, `time` and a variable matching the default dataset's variable, along with their load-bearing attributes like `units`, but "extra" attributes like `REFERENCES` are probably skippable.

### ncWMS Mocks For Portal-Specific tests

Thankfully, full maps do not need to be loaded for tests, but some metadata is needed.

#### getNCWMSLayerCapabilities
A representation of ncWMS's `GetCapabilities` query, a very long xml document. Needs to include, at minimum, the unique ID of the dataset in question, and the default timestamp, which can be found in the portal's initialization javascript, in their usual places in the `<LAYER>` element.

The xml includes a long list of available palettes; all but the default one specified in the portal's map initial code are skippable and do not need to be mocked (`default/ferret`for most variables; `default/blueheat` for some precipitation datasets, `default/occam` for some others).