# News / Release Notes

## 3.0.3

*Release Date: 07-Jan-2021*

- [Set `COLORSCALERANGE` where absent](https://github.com/pacificclimate/pdp/pull/196)

## 3.0.2

*Release Date: 05-Jan-2021*

Because you shouldn't delete and then recreate a tag on a different commit!
This release should create an unambiguous PyPI package.

## 3.0.1

*Release Date: 05-Jan-2021*

- Install Sphinx before PyPI build
- Fix Anchore scan

## 3.0.0

*Release Date: 05-Jan-2021*

Note: This release of PDP cannot be run against an ncWMS 1.x instance.
Hence the increment of major version number.

* [Updates portals to make requests to ncWMS 2.x](https://github.com/pacificclimate/pdp/pull/188)
* [Fixes Python CI action](https://github.com/pacificclimate/pdp/pull/192)
* [Removes Docker image build for pull requests](https://github.com/pacificclimate/pdp/pull/190)
* [Fixes the PyPI publishing workflow](https://github.com/pacificclimate/pdp/commit/2971d1c2b3beada076392a1cebc27fe627837582)

## 2.10.1

*Release Date: 29-Sept-2020*

* Adds CRD and UNBC_CAM networks to the PCDS frontend

## 2.10.0

*Release Date: 07-Apr-2020*

* Updates Jenkins pipeline to latest version of PCIC Jenkins library
* Adds new data to the Modelled Streamflow Data portal

## 2.9.0

*Release Date: 22-Jan-2020*

* Sets up Jenkins testing and automatic docker building for this project
* Fixes a bug that caused invalid ncWMS requests when filters were reset
* Fixes a date formatting bug in the map legend of the Gridded Observations portal
* Add notes on working with packed data to user documentation
* Add new data to the Gridded Hydrologic Model Output portal


## 2.8.0

*Release Date: 23-Aug-2019*

* Updates bulk data test suite to include files without record variables
* Fixes a MemoryError caused by unnecesary allocation in pupynere-pdp
* Adds tests for javascript components of portal
* Fixes to time range selection UI:
  
  * disable download button when invalud dates are selected
  * correct off-by-one date calculation error
  * add calendar handling and calculation classes
  

## 2.7.0

*Release Date: 30-Apr-2019*

* Adds use of the NetCDF 64-bit offset format for large (>2 GB) raster files
* Adds documentation about downloading timeseries and the expected performance
* Adds a robots.txt file to the frontend, disallowing backend crawling
* Addresses security vulnerabilities in requirements


## 2.6.5

*Release Date: 20-Mar-2019*

* [Fixes](https://github.com/pacificclimate/pydap.handlers.hdf5/commit/68d834c681664d6d1a12ce6f2f5bdb49430b3ba8) 
  [a problem](https://github.com/pacificclimate/pydap.handlers.hdf5/issues/3) 
  [where requesting](https://github.com/pacificclimate/pdp/issues/106) 
  a beginning start time index
  late in a timeseries would take a long time to begin the response.

## 2.6.4

*Release Date: 15-Mar-2019*

* [Fixes](https://github.com/pacificclimate/pupynere-pdp/commit/207cde6f0e763da8292432adbc0e6fb2d53830a0) 
  [several small bugs](https://github.com/pacificclimate/pydap.responses.netcdf/issues/6) 
  in the NetCDF response with respect
  to bad content-length header when short or char (i.e. packed; < 4
  byte data types) variables are present. Fixes calculations of
  content-length as well as padding emission.

## 2.6.3

*Release Date: 11-Mar-2019*

* [Fixes](https://github.com/pacificclimate/pydap.responses.netcdf/pull/5)  
  [a bug](https://github.com/pacificclimate/pydap.responses.netcdf/issues/4) 
  where portal enters an infinite loop if serving
  datasets with no record variables

## 2.6.2

*Release Date: 28-Feb-2019*

* Corrects a bad release number in previous release

## 2.6.1

*Release Date: 27-Feb-2019*

* Fixes docs/ URL

## 2.6.0

*Release Date: 07-Feb-2019*

* Fixes bug that generated undefined time intervals
* Streamlines code and improves ease of new portal generation
* Upgrades to a new version of pdp_util to improve connection management
* Adds version 2 of the BCCAQ data

## 2.5.2

*Release Date: 29-Jun-2018*

* Fixes bug in Pydap/gunicorn incompatibilities
* Upgrades gunicorn to allow for async workers
* Make tilecache URL configurable at Docker deploy runtime

## 2.5.1

*Release Date: 04-Jun-2018*

* Updates UI and map extent for the Gridded Observation portal
* Simplifies deployment configuration to allow front and back ends to be deployed seperately

## 2.5.0

*Release Date: 08-May-2018*

* Adds a monthly timeseries to the BC Prism portal

## 2.4.5

*Release Date: 13-Mar-2018*

* Improves Docker-based deployment process
* Adds more documentation for advanced/programatic usage
* Enforces PEP8 style guidlines across the entire code base

## 2.4.4

*Release Date: 03-Jan-2018*

* Makes UI tweaks for gridded observations portal

  * Display name changes
  * Uses log scale for precipitation

## 2.4.3

*Release Date: 15-Dec-2017*

* Adds new gridded observations portal hosting data used for
  hydrologic modelling
* Fixes bug in Pydap, enabling 
  [empty hyperslab syntax](http://docs.opendap.org/index.php/DAP4:_Specification_Volume_1#Array_Subsetting_in_Index_Space)
* Fixes PCDS issue where climo listings show up along with raw data
* Fixes PCDS issues where requests for stations with NULL elevations
  or NULL locations fail

## 2.4.2


*Release Date: 4-Jul-2017*

* Fixes PCDS issue where zipfiles could be corrupted when downloading
  from stations without data
* Enables Zip64 encoding to allow large (> 2 GB) Arc/ASCII Grid files
* Improves date handling on raster data portal. Adds awareness of 360
  and 365 day calendars in the web user interface.
* Corrects URL in the power user documentation.

## 2.4.1

*Release Date: 17-Nov-2016*

* Adds a checkbox to applicable raster pages to disable the date range
  selector and download the full timeseries

## 2.4.0

*Release Date: 15-Nov-2016*

* Colorbar improvements on the raster portals

  * Sets the colorbar legend according to range
  * Adds documentation for the colorbar to the user docs
  * Fixes bug where colorbar was out of sync with dataset range

* Download features

  * Adds a map tool to download a single raster cell

* Deployment improvements

  * Updates developer docs and deployment guide
  * Adds support for deploying with Docker
  * Improves test suite to run on TravisCI
  * Includes VC commit has in all docs and web pages

## 2.3.6

*Release Date: 4-Jan-2016*

* Fix VIC model output default display time

## 2.3.5

*Release Date: 8-Oct-2015*

* Add capability to serve PRISM 1981-2010 climatologies
* Fix Colorbar logarithmic midpoint calculation

## 2.3.4

*Release Date: 13-Aug-2015*

* Fixes multiple race conditions due to global variable use.

## 2.3.3

*Release Date: 12-Aug-2015*

* Ensure changes to climate layer on raster portals updates download link

## 2.3.2

*Release Date: 11-May-2015*

* Add VIC input data to Gridded Hydrologic Data portal (ensemble updated in mddb)

  * Add input variable name mapping, update restricted extent

## 2.3.1

*Release Date: 6-May-2015*

* Fix raster portal date parsing bug

## 2.3.0

*Release Date: 13-Apr-2015*

* Downloads initialted on user action with reactive links
* Split front/back end to separate wsgi callables
* Source config file from system environment
* JSlint all frontend js code


## 2.2.5

*Release Date: 30-Mar-2015*

* Pull in updated pupynere-pdp version by incrementing pydap.handlers.hdf5 and pydap.responses.netcdf versions - Fixes streaming netcdfs without unlimited dimensions

## 2.2.4

*Release Date: 30-Jan-2015*

* Tweaks to the usage of SQLAlchemy's database connection pools

## 2.2.3

*Release Date: 05-Dec-2014*

* Fixed a bug in the PCDS Portal where using the "Clip time series to filter date range" could possibly return a station file with zero observations
* Tuned network/station listings in the PCDS Portal to require less data and avoid possible database timeouts with large groups of stations

## 2.2.2

*Release Date: 16-Nov-2014*

* Updates to user docs mostly with respect to filing bug reports and getting support

## 2.2.1

*Release Date: 30-Oct-2014*

* Hotfix: Fix IE8 Colorbar bug

## 2.2.0

*Release Date: 24-Oct-2014*

* Addition of the VIC Modelled Streamflow Data page

  * Wrote new station search control
  * Wrote new map based selection control
  * Added station metadata to the repo
  * Added an app that uses Pydap's CSVHandler to serve the data

* Added a dynamically generated color scalebar to each of the four raster portal pages

  * fetches graphics from ncWMS
  * fetches variable ranges from pdp
  * assembles the graphic in the DOM

* Better error handling

  * Wrote error notification pages that are more than just text
  * Ensured full logging of all exceptions

* Updates to the available OpenID providers

* Added full variable names on the BC PRISM page

## 2.1.5

*Release Date: 21-Oct-2014*

* Hotfix: Bump dependency versions

  * Bump pydap.responses.netcdf to version 0.5 - Fixes failure case where dates < 1900
  * Bump pydap.handlers.sql to version 0.9 - Fixes check for empty results during type peeking

## 2.1.4

*Release Date: 21-Oct-2014*

* Hotfix: Bump pdp_util version, fixes xls "Bad request" respose

## 2.1.3

*Release Date: 25-Sept-2014*

* Hotfix: Remove MyOpenID as an openid endpoint

  * Remove from auth popup
  * Bump pdp_util version to 2.1

## 2.1.2

* Hotfix: patch around broken inline authentication with pcds portal

## 2.1.1

* Hotfix: update yahoo openid endpoint url

## 2.1.0

*Release date: 24-Jul-2014*

* Addition of the VIC Hydrologic Model Output Portal
* Addition of the BCCAQ Downscaling Extremes (ClimDEX) Portal

  * Timeseries on map click feature (available in ClimDEX portal)

* New output formats available for some portals

  * Arc GIS/ASCII Grid file (available in all coverage portals)
  * Excel 2010 (XLSX) (available in PCDS portal)

* Mods to the HDF5 handler to make it more robust

  * Added the ability to slice a sliced proxy object (for use in slicing multiple times and then iterating over the result)
  * Fixed errors on iteration and dimension retreival for variables of rank 1
  * Fixed bug for multiple iterators couldn't access the same HDF5Data object
  * Fixed bug in Pydap that caused redundant and incorrect last-modified timestamps on data from hdf5 files

* Bugfix in SQL handler (used by the PCDS portal) which caused the NetCDF response to fail for a subset of stations (stations where NULL is the first value in the timeseries for any variable)
* Included more documentation describing the raster data formats

## 2.0.2

*Release date: 21-May-2014*

* Maintenance on neglected PCDS station listing pages
* pydap.handlers.pcic

  * Fixed bug in PCDS path handler that didn't match hyphen in the network name (e.g. FLNRO-WMB)
  * Added a context manager to all database connections so that they always get cleaned up

* Inclusion of renamed Google Analytics module to avoid package namespace collisions
* Other minor code cleanup

## 2.0.1

*Release date: 18-Mar-2014*

* First bugfix release of the PCIC Data Portal
