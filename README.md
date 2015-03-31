pdp - PCIC Data Portal
======================

The PCIC Data Portal contains the frontend code required for the [PCIC Data Portal](http://www.pacificclimate.org/data) as well as WSGI callables to deploy the entire application within a WSGI container.

Installation
------------

The following guide assumes a debian based system.

### Prerequisites

The pdp requires that pip and tox be installed.

<pre>
sudo apt-get install python-pip python-dev build-essential
sudo pip install tox ## or pip install tox --user
</pre>

Some of the required python libraries have system-level dependencies.

<pre>
sudo apt-get install libhdf5-dev libnetcdf-dev libgdal-dev
</pre>

And GDAL doesn't properly source it's own lib paths when installing the python package:

<pre>
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
</pre>

### Installation

With the prerequisites, creating a development environment should be as simple as:

<pre>
git clone https://github.com/pacificclimate/pdp
cd pdp
git checkout dev
tox -e devenv
</pre>

It could take 5-30 minutes since tox will not use system packages and needs to build any package which requires it.

Configuration
-------------

Running the data portal requires changing the app_root variable in [config.yaml](pdp/config.yaml) to where the app will be exposed. The data servers rely upon locally available data and will not be functional in an isolated development environment.