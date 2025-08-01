Code Organization of the PCIC Data Portal
=========================================

The PCIC Data Portal consists of a number of components. The developer docs explain in detail the python components of the data portal, but in this section we will give a brief description of everything required to make the data portal run.

Mapping
-------

Maps are central to the user interface of the data portal. PCIC runs instances of several map server software tools in order to provide the necessary layers.

TileStash
^^^^^^^^^

All basemaps are based on OpenStreetMap data, rendered with Mapnik and are served up by TileStash.

Note: This is true for portals implemented with this PDP code; it may only be approximately true of other portals implemented separately (e.g., BC Station Data, a.k.a. Met Data Portal - PCDS).

ncWMS
^^^^^

All raster overlay layers are rendered and served by a PCIC-modificiation of the stock ncWMS.


Pydap
-----

In the past, we used Pydap as our OPeNDAP backend server for all of our data portals, but it is now solely used for the (now deprecated) PCDS portal.

Our initial PCDS portal was developed against the stable Pydap hosted here:
https://code.google.com/p/pydap/

Our initial raster portal was developed against the development version of Pydap hosted here:
https://bitbucket.org/robertodealmeida/pydap

But now he's developing on github with a branch that looks pretty similar to the inital stable version:
https://github.com/robertodealmeida/pydap


THREDDS
-------

In the latest version of the data portal, we have transitioned from serving our raster data and hydro station data via Pydap to our deployment of the THREDDS Data Server (TDS), which is developed and supported by Unidata, a division of the University Corporation for Atmospheric Research (UCAR). More information about this server can be found here:
https://www.unidata.ucar.edu/software/tds/current/

Using THREDDS has allowed us to mitigate the challenges associated with maintaining the codebase while using Pydap. Despite this, it comes with its own challenges. Most notably, OPenDAP requests have a size limit of 500 MB. To allow users to request larger datasets, we developed an OPeNDAP Request Compiler Application (ORCA), which recursively bisects initial requests larger than 500 MB, sends those smaller requests to THREDDS, and concatenates the returned data before returning that to the user. More information about this application can be found here:
https://github.com/pacificclimate/orca

Data Interfaces
---------------

We have written two package which moderate the data store layer. With both [#exception]_ are included a stripped down testing dataset (in sqlite) and fixture such that reverse depends packages can write write against the data which will run quickly and independently of a production database. Both packages use :py:mod:`sqlalchemy` as an Object Relational Model (ORM) layer and export objects to represent the database entities.

PyCDS
^^^^^

:py:mod:`PyCDS` provides an ORM for data in the PCDS (i.e. the crmp database). It is documented here: :doc:`pycds`.


modelmeta
^^^^^^^^^

:py:mod:`modelmeta` provdies an ORM for the data in the modelmeta database which tracks all available raster data sets.

Custom python packages and modules
----------------------------------

We have written several python packages and modules that fill in the functionality gaps for things which were not available off-the-shelf (or *almost* off-the-shelf).

pydap.handlers.pcic
^^^^^^^^^^^^^^^^^^^

This is a handler for pydap which serves up PCDS data from our data store. It depends on pydap's :py:class:`SQLHandler`, for which implementation details vary across version of pydap. It's documented in detail here :doc:`pydap.handlers.pcic`.


pdp_util
^^^^^^^^

This (terribly named) package essentially provides "everything else" that was required to run the data portal, but didn't have any purpose or opportunity for reusability outside of the data portal. This package is documented in detail here: :doc:`pdp_util`.

.. rubric:: Footnotes

.. [#exception] At present, modelmetadata doesn't actually have a test dataset.
