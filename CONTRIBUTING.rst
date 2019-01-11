.. _contributors-guide:

Contributor's Guide
===================

.. _how-to-report-bugs:

How to report bugs
------------------

If you think that there is a problem or bug with the data portal, please let us know! We welcome bug reports, but ask that you follow a few guidelines when doing so. To report a bug:

- `Create a new issue`_ on our GitHub page.
- Tag/label the issue as a bug
- Leave it unassigned

Then please follow these guidelines for writing your report:

- Please describe in as much detail as possible
- Include a complete description of:

  - Exactly what you did (i.e. "steps to reproduce")
  - What you expected to happen?
  - What did happen?

- If you received an error message *cut and paste* the error message *exactly*. Do not report "there was an error". Do not paraphrase the error.
- Please include the time (and timezone) that this occurred. Sometimes we can get more information from the logs, but only if we have a time to reference.
- Include your IP address (`you can find it here`_). Again, this helps us find your requests in the logs.
- If you had a problem with the web user interface, feel free to include your browser version. That information is sometimes relevant (though less often than you might expect).

I cannot stress enough how important it is to contrast what you expected to happen, with what actually happened. When executing the code does not produce the *advertised* result, there is a bug in the system. When the code does not produce the result that you *wished* it had, this is *not* a bug. We receive far too many reports in the latter category.

Many people attempt to provide a diagnosis when reporting bugs in the hopes that it will be helpful. Please *refrain* from doing this, and stick to reporting known facts: what did you do and what did you observe. If you skip these important things and jump right to what could be an incorrect diagnosis, it is highly likely that you will delay the troubleshooting.

If you're *really* committed to writing a stellar bug report, look through the guidelines for `writing *effective* bug reports <http://www.chiark.greenend.org.uk/~sgtatham/bugs.html>`_.

.. _you can find it here: http://whatismyipaddress.com/

What happens next?
^^^^^^^^^^^^^^^^^^

This depends. If you've provided enough information that we can reproduce and verify your problem, then we will accept the bug, tag it with a priority and assign it to a developer on our team. Though we will do our best to prioritize this work, none of PCIC's funders support maintenance or bug fixes. So we will work on it as we are able.

If you have not provided enough information for us to confirm a bug, we may tag the issue "Needs Info" or "Invalid". Please don't take this personally. However, you can assume that we will not put any time against this ticket until you do more to convince us that it *is* actually a problem.

.. _Create a new issue: https://github.com/pacificclimate/pdp/issues/new


Don't code? No problem!
-----------------------

Even if you don't program for a living there are plenty of ways to help. Not only is the data portal code open and collaborative, but so is the documentation and issue tracking. Anyone can help with these. If you can't program, consider helping with the following:

- If the documentation doesn't answer your questions, it probably doesn't answer many people's questions. Help us all out and write something that does.
- Take a look through the outstanding `"help wanted" issues`_, and see if you know any of the answers.
- If there are `open bug reports`_, see if you can reproduce the problem and verify that it exists. Having bug reports validated and/or clarified by multiple parties is extremely valuable.
- Tell us your story. If the PCIC Data Portal has helped your research or project, we would love to hear about it. Write a blog post and/or `send us an e-mail`_.

.. _"help wanted" issues: https://github.com/pacificclimate/pdp/labels/help%20wanted
.. _open bug reports: https://github.com/pacificclimate/pdp/labels/bug
.. _send us an e-mail: mailto:hiebert@uvic.ca

.. _deployment-guide:

Deployment Guide
================

The following guide will get you set up running the PCIC Data Portal in Docker. More information about the data portal can be found `here`_.

Installation
------------

.. code:: bash

    git clone https://github.com/pacificclimate/pdp
    cd pdp

Quickstart
----------

Create a data volume container to access the locally stored data required to run the PDP (this is most likely in /storage/data/):

.. code:: bash

    docker run --name pdp_data -v /path/to/data/:/storage/data/:ro ubuntu:16.04

Build the pdp docker image:

.. code:: bash

    docker build -t pdp .

Review (and edit if necessary) the container options in the two docker environment files: ``docker/fe_deployment.env`` and ``docker/fe_deployment.env``. Then start the containers using ``docker-compose`` (use ``-d`` if you want to run them in the background):

.. code:: bash

    cd docker
    docker-compose up

The dataportal frontend will be accessible on port 8000 of the docker host while the data backend will be accessible on port 8001.


Details
-------

Environment configuration
^^^^^^^^^^^^^^^^^^^^^^^^^

A full list of the available environment variables is found below. These can be specified in a docker environment file or at container runtime using the ``-e`` option:

.. code:: bash

    docker run -e APP_ROOT=<url> -e DATA_ROOT=<url> ...

Default values are provided for the majority of these variables in the environment file ``pdp/config.env``. Those that do not have default values and must be specified by the user are marked with an asterisk (*). Environment variables defined at runtime will overwrite any previously existing ones.

pdp/config.env
""""""""""""""

| ``APP_ROOT``
| The root location URL where the data portal will be exposed in the form ``<docker_host>:<port>``. Default port is 8080.
|
| ``DATA_ROOT``
| Root location URL of the back-end data server. By default, this should be ``<docker_host>:8001``.
|
| **\*** ``DSN``
| Raster metadata database URL of the form ``dialect[+driver]://username:password@host:port/database``. A default URL is provided in the template, however, a password will be required.
|
| **\*** ``PCDS_DSN``
| PCDS database URL of the form ``dialect[+driver]://username:password@host:port/database``. A default URL is provided in the template, however, a password will be required.
|
| ``GEOSERVER_URL``
| PCDS Geoserver URL of the form ``<docker_host>:<port>/geoserver/``. The host/port must match ``APP_ROOT``.
|
| ``NCWMS_URL``
| Raster portal ncWMS URL of the form ``<docker_host>:<port>/ncWMS/``. The host/port must match ``APP_ROOT``.
|
| ``USE_ANALYTICS``
| Enable or disable Google Analytics reporting (default is ``true``).
|
| ``ANALYTICS``
| Google Analytics ID.


docker basics
^^^^^^^^^^^^^

The docker image used to run this application is named ``pdp``. This image is responsible for running *either* the PCIC data portal's frontend *or* backend. Which part of the port is run, is determined by the ``APP_MODULE`` environment variable, set at container run time. ``APP_MODULE`` should be set to either ``pdp.wsgi:frontend`` or ``pdp.wsgi:backend``.

Docker containers will remain up as long as there is an active process running within them. For debugging, one can use the ``-it`` options to begin an interactive container. For general deployment however, you should use ``-d`` to run the container as a daemon/background process. For the rest of this guide, we'll assume daemon-style usage.

pdp
^^^

This image automates the build process for the PDP Data Portal. Using Ubuntu 17.10 as a base, all the required steps are performed to create a working environment (dependencies installed, environment variables set, etc). The Dockerfile outlines each of these steps in greater detail.

To build the image, run ``docker build -t pdp .`` from the root pdp directory. The ``-t`` option will name the image; if no name is specified, docker will randomly generate one for you.

The Dockerfile will default to building an image from the current branch of the pdp repo. If you wish to build from a different branch, use ``git checkout <branch>`` before building the image.

Once the image has been built, you should see it under ``docker images``. Now it is possible to spin up docker container(s) which will run an instance of the pdp based off your image.

.. code:: bash

    docker run -d --name <container_name> <image_name>

By default, the pdp Dockerfile exposes port 8000 (the port that gunicorn will run on inside the container) but in order to access the container it needs to be published to the outside world using ``-p <host_port>:<container_port>``

.. code:: bash

    docker run -d --name <container_name> -p 8000:8000 <image_name>

The container is now accessible on the docker host by visiting ``http://<host>:8000``.

Data Volume Container
^^^^^^^^^^^^^^^^^^^^^

Not all data is accessible to the pdp remotely, some of it (the hydro station output, for example) is stored in the host environment. Docker provides a nice utility called ``volumes`` which makes host directories accessible to Docker containers, but to avoid constantly having to specify the paths when creating a new Docker container we can use what's called a "data volume container". Target host directories are mounted inside the container using the ``-v`` option, which defaults to read-write mode. However, as we do not want our application to be able to modify the data files on the host all volumes in the data volume container should be made read-only by appending ``:ro``.

The following command will create a data volume container. This should only need to be run once, as data volumes in docker are persistent and will remain even after the container has exited.

.. code:: bash

    docker run --name pdp_data -v /storage/data/climate/:/storage/data/climate/:ro \
                               -v /storage/data/projects/hydrology/vic_gen1_followup/:/home/data/projects/hydrology/vic_gen1_followup/:ro \
                               -v /storage/data/projects/dataportal/data/:/storage/data/projects/dataportal/data/:ro \
                               ubuntu:17.10

Once the data volume container has been created, these volumes can be brought into other containers at runtime:

.. code:: bash

    docker run --name <container_name> --volumes-from pdp_data <image_name>

Configuration
"""""""""""""

Any values in the ``pdp/config.env`` file can be set at run time. These environment variables can be passed to docker on the command line:

.. code:: bash

    docker run -e APP_ROOT=<url> -e DATA_ROOT=<url> ...

Or by using a environment file with a list of neceesary environment variables:

.. code:: bash

   docker run --env-file my_vars.env ...

A full list of the config items can be found in the "Environment configuration" section above. If no environment variables are specified at runtime, the default values (stated in the templates) will be used. Any changes to the template files in ``docker/templates`` will require the pdp image to be re-built.


Putting it all together
^^^^^^^^^^^^^^^^^^^^^^^

The final sequence of docker commands to run ``pdp`` should be something like this:

.. code:: bash

    docker run --name pdp_data -v /storage/data/climate/:/storage/data/climate/:ro \
                               -v /storage/data/projects/hydrology/vic_gen1_followup/:/home/data/projects/hydrology/vic_gen1_followup/:ro \
                               -v /storage/data/projects/dataportal/data/:/storage/data/projects/dataportal/data/:ro \
                               ubuntu:17.10 /bin/bash
    docker run --name <container_name> --volumes-from pdp_data \
               -p 8000:8000 -p 8001:8001 \
               -e DSN=<dsn> -e PCDS_DSN=<pcds_dsn> \
               -e APP_MODULE=pdp.wsgi:frontend \
               -d pcic/pdp
    docker run --name <container_name> --volumes-from pdp_data \
               -p 8001:8001 \
               -e DSN=<dsn> -e PCDS_DSN=<pcds_dsn> \
               -e APP_MODULE=pdp.wsgi:backend \
               -d pcic/pdp

Docker Compose
^^^^^^^^^^^^^^
*(requires docker-compose v1.6.0+)*

`Docker Compose`_ can be used to simplify the deployment of multi-container applications. In order to use Docker Compose, runtime behaviour for the individual containers is defined in a ``docker-compose.yaml`` file. Once configured, run ``docker-compose up`` from the ``docker`` directory to start both the front-end and back-end applications.

.. _here: https://github.com/pacificclimate/pdp/blob/master/README.md
.. _jinja2: http://jinja.pocoo.org/
.. _j2cli: https://github.com/kolypto/j2cli
.. _README: https://github.com/pacificclimate/pdp/blob/master/README.md
.. _Nginx: https://www.nginx.com/
.. _Docker Compose: https://docs.docker.com/compose/overview/
