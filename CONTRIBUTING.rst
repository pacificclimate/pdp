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

The following guide will get you set up running the PCIC Data Portal with an Nginx reverse proxy in Docker. More information about the data portal can be found `here`_.

Installation
------------

Clone this repo and navigate to the directory containing the Docker files:

.. code:: bash

    git clone https://github.com/pacificclimate/pdp
    cd pdp/docker/

Quickstart
----------

Create a data volume container to access the locally stored data required to run the PDP (this is most likely in /storage/data/):

.. code:: bash

    docker run --name pdp_data -v /path/to/data/:/storage/data/:ro ubuntu:16.04

Build the pdp and nginx docker images:

.. code:: bash

    docker build -t pdp .
    docker build -t nginx-proxy proxy/.

Start the containers using ``docker-compose`` (use ``-d`` if you want to run them in the background):

.. code:: bash

    docker-compose up

The dataportal will be accessible on port 8080 of the docker host.


Details
-------

Two docker images are used to run this application: the ``pdp`` image is responsible for running the PCIC data portal, and the ``nginx-proxy`` image creates a dockerized reverse-proxy (necessary for the pdp to operate successfully).

pdp
^^^

This image automates the build process for the PDP Data Portal. Using Ubuntu 16.04 as a base, all the required steps are performed to create a working environment (dependencies installed, environment variables set, etc). The Dockerfile outlines each of these steps in greater detail.

To build the image, navigate to ``pdp/docker/`` and run ``docker build -t pdp ./``. The ``-t`` option will name the image; if no name is specified, docker will randomly generate one for you.

The Dockerfile will default to building an image from the ``master`` branch of the pdp repo. If you wish to checkout a different branch, specify a build-time arg:

.. code:: bash

    docker build --build-arg BRANCH=<branch> -t <image_name> .

Once the image has been built, you should see it under ``docker images``. Now it is possible to spin up docker container(s) which will run an instance of the pdp based off your image.

.. code:: bash

    docker run --name <container_name> <image_name>

Docker containers will remain up as long as there is an active process running within them. Use the ``-it`` options to begin an interactive container, or ``-d`` to run the container as a background process.

**Note**: If you wish to run the pdp container interactively, change the final ``CMD`` in the pdp Dockerfile to specify ``/bin/bash`` rather than ``supervisord`` and rebuild the image. To detach from a running docker container use the escape sequence ``ctrl+p`` + ``ctrl+q``. Re-attach with ``docker attach <container_name>``.

By default, the pdp Dockerfile exposes port 8000 (the port that gunicorn will run on inside the container) but in order to access the container it needs to be published to the outside world using ``-p <host_port>:<container_port>``

.. code:: bash

    docker run --name <container_name> -p 8000:8000 -it <image_name> 

The container is now accessible on the docker host by visiting ``http://<host>:8000``.

Data Volume Container
^^^^^^^^^^^^^^^^^^^^^

Not all data is accessible to the pdp remotely, some of it (the hydro station output, for example) is stored in the host environment. Docker provides a nice utility called ``volumes`` which makes host directories accessible to Docker containers, but to avoid constantly having to specify the paths when creating a new Docker container we can use what's called a "data volume container". The following command will create a data volume container and mount the target host directory (most likely /storage/data/). ``:ro`` signifies that this is a "read-only" volume.

.. code:: bash

    docker run --name pdp_data -v /path/to/data/on/host/:/storage/data/:ro ubuntu:16.04

Once the data volume container has been created, this volume can be brought into other containers at runtime:

.. code:: bash

    docker run --name <container_name> --volumes-from pdp_data <image_name>

Configuration
"""""""""""""

To avoid baking the configuration files (``pdp_config.yaml`` and ``supervisord.conf``) into the image we use `j2cli`_ which leverages the `jinja2`_ template engine to generate config files at container runtime. Values in the template files can be set using docker environment variables:

.. code:: bash

    docker run -e APP_ROOT=<url> -e DATA_ROOT=<url> ...

If no environment variables are specified at runtime, the default values will be used. The `README`_ gives a more in-depth explanation of the individual config items. Any changes to the template files in docker/templates will require the pdp image to be re-built.


Nginx
^^^^^

`Nginx`_ is used as a reverse proxy in front of the pdp. To build the image from the nginx Dockerfile, edit ``proxy/nginx.conf`` then run:

.. code:: bash

    docker build --name nginx-proxy proxy/.

Configuration
"""""""""""""

Nginx should be configured to listen on the same port as the container running the proxy server. For example, if the server is listening at port 8080 then the container running the proxy should be published to the same port on the host:

.. code:: bash

    docker run --name nginx-proxy -p 8080:8080 -d nginx-proxy

In order to see the application running at ``http://<host>:8080``, specify the root location ``proxy_pass`` directive to point to the container running the pdp. If the pdp container has been published on port 8000, this would look like:

.. code::

    location / {
        proxy_pass    http://<host>:8000;
    }

The geoserver and ncWMS locations correspond to the ``geoserver_url`` and ``ncwms_url`` values in ``pdp_config.yaml``, respectively. These should be proxied to the production servers at ``tools.pacificclimate.org/[geoserver|ncWMS-PCIC/wms]``.


Docker Compose
^^^^^^^^^^^^^^

`Docker Compose`_ can be used to simplify the deployment of multi-container applications. In order to use Docker Compose, runtime behaviour for the individual containers is defined in a ``docker-compose.yaml`` file (make sure the pdp image runs the ``supervisord`` CMD on startup). Once configured, run ``docker-compose up`` to start the entire app.

.. _here: https://github.com/pacificclimate/pdp/blob/master/README.md
.. _jinja2: http://jinja.pocoo.org/
.. _j2cli: https://github.com/kolypto/j2cli
.. _README: https://github.com/pacificclimate/pdp/blob/master/README.md
.. _Nginx: https://www.nginx.com/
.. _Docker Compose: https://docs.docker.com/compose/overview/
