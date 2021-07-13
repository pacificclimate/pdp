## Table of Contents

- [Installation](#installation)
  - [Dependencies](#dependencies)
    - [Python](#python)
    - [Node.js (test framework only)](#nodejs-test-framework-only)
  - [Development Install](#development-install)
    - [Server](#server)
    - [JS tests](#js-tests)
  - [Production Install](#production-install)

# Installation

The sections below detail how to install the projects onto your machine.

## Dependencies

There are some items that need to be installed before we can install the project requirements.

### Python

The server for the PDP frontend is written in Python. It packages up, minifies, and serves the various "static" JS files and other resources (e.g., CSS) from which the frontend is built.

The pdp requires that pip and tox be installed.

```bash
sudo apt-get install python-pip python-dev build-essential
sudo pip install tox ## or pip install tox --user
```

Some of the required python libraries have system-level dependencies.

```bash
sudo apt-get install libhdf5-dev libnetcdf-dev libgdal-dev
```

And GDAL doesn't properly source it's own lib paths when installing the python package:

```bash
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
```

### Node.js (test framework only)

The test framework for the PDP frontend runs in [Node.js](https://nodejs.org/en/).

There are several different valid ways to install Node.js on a Ubuntu system.

We reccomend using [nvm](https://github.com/creationix/nvm) to manage your node/npm install. It is a little more laborious (not a lot), and provides a lot more flexibility than the simpler installation methods, which you can look up by searching "ubuntu install nodejs".

## Development Install

For development follow these installation instructions

### Server

With the prerequisites, creating a development environment should be as simple as:

```bash
git clone https://github.com/pacificclimate/pdp
cd pdp
tox -e devenv
```

It could take 5-30 minutes since tox will not use system packages and needs to build any package which requires it.

### JS tests

With Node.js installed (see above), you can install all the test framework dependencies
as follows:

```bash
npm install
```

Notes:

* The JS tests are written using test framework called [Jest](https://jestjs.io/) which provides many useful features, including a simulation of the DOM in JS that enables tests of code that manipulate the DOM.

* DOM simulation is provided by a package called `jsdom`, which ships with Jest. However, the version that currently ships lacks a couple of features that we need, so we install `jest-environment-jsdom-fourteen`, which upgrades the version of `jsdom`. This may become unnecessary with later versions of Jest.

* Since little of the JS code is written with unit testing in mind, we exploit `jsdom` heavily in the tests. Essentially, these tests use jQuery queries to find out what is going on in the DOM as the app does its thing.

## Production Install

It is best practice to maintain a consistent virtual environment for production.

```bash
git clone https://github.com/pacificclimate/pdp
cd pdp
virtualenv pyenv
```

The pdp will run in any WSGI container. This guide uses gunicorn.

```bash
pyenv/bin/pip install -i https://pypi.pacificclimate.org/simple/ -r requirements.txt -r data_format_requirements.txt -r test_requirements.txt -r deploy_requirements.txt
```

Install and build the docs. Building the docs requires the package to be installed, then installed again after the docs are built.

```bash
pyenv/bin/python setup.py install
pyenv/bin/python setup.py build_sphinx
pyenv/bin/python setup.py install
```