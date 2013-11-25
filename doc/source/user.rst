User Documentation for the PCIC Data Portal
===========================================

The main goal of the PCIC Data Portal boils down to one simple idea: *give users data*. The Data Portal attempts to provide a flexible system to give you the climate data that you need and *only* the climate data that you need. Spatiotemporal climate data can be extremely bulky and expensive to store, so we have created a system that doesn't waste resources by giving users more information than that in which they are interested. Selecting only one's data of interest is a foundational idea of the system.

Provincial Climate Data Set Portal
----------------------------------

Searching for stations
^^^^^^^^^^^^^^^^^^^^^^

The primary supported method by which users can search for meteorological stations is by way of the map which takes up most of the screen real estate. The map shows all of the stations which meet the selection criteria in the "Filter Options" fieldset on the right-hand side of the window.

To navigate the map, one can either use the zoom/pan controls in the upper left hand corner of the map, or simply use left-click, drag to pan and the mouse scroll wheel to zoom.

.. figure:: images/nav.png

Note that zooming in to a particular area does not exclude stations which are out of your field of view. To select a spatial subset of stations, one can draw one or more polygons on the map. To do so you must first switch to the polygon selection tool in the upper right hand corner.

.. figure:: images/draw_polygon_on.png

Once in polygon selection mode you can start drawing a polygon by left-clicking on the map. This will add the first vertex and subsequent verticies can be added with further left clicks. To finish the polygon, double-left-click to add your final vertex. After you close your polygon, both the map and the "Selection Information" text box will automatically update.

.. figure:: images/polygon_selection.png

There are several other controls available for further refining the selected stations. A user can select by date range, meteorologic variable, network name, frequency of observations and whether or not the stations have available a 1971-2000 normal period climatology. Selected stations are those which meet *all* of the constraints.

The "Date Range" option will select an stations for which their date range overlaps with the user supplied date range. Note that many PCDS stations *do* have gaps in the data, so this simple range check does not necessarily guarantee that select stations have data within the range.

TO BE CONTINUED



Getting station info
^^^^^^^^^^^^^^^^^^^^

Retrieving station data
^^^^^^^^^^^^^^^^^^^^^^^

Climate Coverage Portals
------------------------

The Climate Coverage Portals make available spatiotemporal climate data for a number of PCIC's products such as downscaled climate model output, high resolution climatologies, and hydrologic model output. This bulk data is necessarily very large which presents both opportunities and challenges. A single scenario of BCSD downscaling output (of which there are dozens) requires about 15GB of binary storage (more for ASCII). Subsets can be much smaller, however if you as a user are not prepared for handling many large files such as these, you should consider leveraging PCIC's interpreted products and services or other web tools such as the `Regional Analysis Tool <http://www.pacificclimate.org/tools-and-data/regional-analysis-tool>`_ or `Plan2Adapt <http://www.pacificclimate.org/tools-and-data/plan2adapt>`_. If you *are* prepared to download, store, and process bulk data, then please read on.

Each page which constitutes a "Climate Coverage Portal" exposes an *ensemble* of data. This ensemble should not be confused with the concept of a climate model ensemble which is used for model intercomparison. In this context an ensemble is simply a set of related files that are published together in the same place. Typically ensemble members have the same spatial domain and a similar purpose and are the result of a single project. For example, all of the Canada-wide BCSD downscaled data is in the same ensemble.

A single page provides three elements:

+ a map is available for limited visualization of the coverage domain, and to select a rectangular area for which to download data
+ a "Dataset Selection" fieldset is available, listing all of the ensemble's datasets available for download
+ a "Download Data" fieldset is shown which allows the user to select a temporal subset, output format and start a download

The user interface only provides the means to download a single dataset. However, we do expose all of the information necessary to script together multiple downloads. In interested in this, please see the advanced user documentation for more details.

Map
^^^

The map shows a single time step of the selected dataset. The datasets's unique id is shown in the lower right hand corner of the map.

.. figure:: images/dataset_id.png

To navigate the map, one can either use the zoom/pan controls in the upper left hand corner of the map, or simply use left-click, drag to pan and the mouse scroll wheel to zoom.

.. figure:: images/nav.png

To select a spatial subset for data download, one must first switch to the polygon selection tool in the upper right hand corner.

.. figure:: images/draw_polygon_on.png

When in spatial subset selection mode, you can select a rectangular area by doing a left-click and drag. When selecting an area on high resolution datasets (e.g. BC PRISM), there is the possibility that the user interface will not resolve from screen resolution to dataset resolution. If this is the case, you will be prompted. The can usually be alleviated by zooming the map to a higher zoom level when performing your selection. To adjust the opacity of the climate overlay, there is an opacity slider in the lower left hand corner.

.. figure:: images/opacity_slider.png

The map is a standard `OpenLayers <http://openlayers.org/>`_ map, so for more details on usage, please refer to the `OpenLayers documentation <http://trac.osgeo.org/openlayers/wiki/Documentation>`_.

To switch back to navigating mode after selecting, you must reselect the hand icon

.. figure:: images/pan_on.png

Dataset selection
^^^^^^^^^^^^^^^^^

The dataset selection fieldset shows a hierarchically organized list of all datasets available for this ensemble.

.. figure:: images/dataset_selection.png

Clicking on category names will expand/collapse all of the data offerings under that category. Clicking on a dataset name at the base of the hierarchy will change the climate overlay which is shown on the map, will update the available dates in the download data fieldset and will generally *select* the dataset such that it will be the one downloaded.

Download data
^^^^^^^^^^^^^

The download data fieldset allows a user to select the time range for which data will be downloaded and an output format. Only output formats which support multidimensional data are offered which includes NetCDF and Character Separated Values (CSV).

Power user HOWTO
----------------

A user with experience in programming or scripting should be able to reasonably recreate functionality of the Climate Coverage Portal in a programattic manner. This section describes some of the deployment details that one would require to do so.

Map
^^^
All mapping is provided using open geospatial protocols. Base maps may be requested using `Open Source Geospatial Foundation's (OSGeo) <http://www.osgeo.org>`_ `Tile Map Service Specification <http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification>`_. We deploy our basemaps via Tilecache and they can be accessed at http://tools.pacificclimate.org/tilecache/tilecache.py/.

Climate raster overlays are served via the `OSGeo's Open Geospatial Consortium's (OGC) <http://www.opengeospatial.org/>`_ `Web Mapping Service (WMS) protocol <http://www.opengeospatial.org/standards/wms>`_. To obtain the climate raster overlays, one may make a valid WMS request to our deployment of `ncWMS <http://www.resc.rdg.ac.uk/trac/ncWMS/>`_ located at http://tools.pacificclimate.org/ncWMS.


Dataset listings
^^^^^^^^^^^^^^^^
The climate coverage data portal serves listings of the available datasets via a JSON-encoded response. This is how the web user interface retreives the data lists, however power users have access to it as well from this URL http://tools.pacificclimate.org/dataportal/[ensemble]/catalog/catalog.json. For example, if one wanted to retreive a list of the datasets available for the BC PRISM ensemble, one could do the following: ::

  james@basalt ~ $ wget --output-document=- http://tools.pcic.uvic.ca/dataportal/bc_prism/catalog/catalog.json 2> /dev/null
  {
      "bcprism_ppt_7100": "http://tools.pcic.uvic.ca/dataportal/bc_prism/data/bc_ppt_7100.nc",
      "bcprism_tmax_7100": "http://tools.pcic.uvic.ca/dataportal/bc_prism/data/bc_tmax_7100.nc",
      "bcprism_tmin_7100": "http://tools.pcic.uvic.ca/dataportal/bc_prism/data/bc_tmin_7100.nc"
  }

The JSON output give you a mapping between the dataset's unique ID and the base URL for a DAP request (described below).


Metadata and Data
^^^^^^^^^^^^^^^^^
All of our multidimensional raster data is made available via `Open-source Project for a Network Data Access Protocol (OPeNDAP) <http://opendap.org/>`_, the specification of which can be found `here <http://www.opendap.org/pdf/ESE-RFC-004v1.2.pdf>`_. Requests are serviced by our deployment of the `Pydap server <http://www.pydap.org/>`_ which PCIC has heavily modified and rewritten to be able to stream large data requests.

The *structure* and *attributes* of a dataset can be retreived using OPeNDAP by making a `DDS or DAS <http://www.opendap.org/api/pguide-html/pguide_6.html>`_ request respectively. For example, to determine how my timesteps are available from one of the BCSD datasets, one can make a DDS request against that dataset as such: ::

  james@basalt ~ $  wget --output-document=- http://tools.pcic.uvic.ca/dataportal/bcsd_downscale_canada/catalog/pr+tasmax+tasmin_day_BCSD+ANUSPLIN300+MPI-ESM-LR_historical+rcp26_r3i1p1_19500101-21001231.h5.dds 2> /dev/null
  Dataset {
      Float64 lat[lat = 510];
      Float64 lon[lon = 1068];
      Grid {
	  Array:
	      Int16 pr[time = 55152][lat = 510][lon = 1068];
	  Maps:
	      Float64 time[time = 55152];
	      Float64 lat[lat = 510];
	      Float64 lon[lon = 1068];
      } pr;
      Grid {
	  Array:
	      Int16 tasmax[time = 55152][lat = 510][lon = 1068];
	  Maps:
	      Float64 time[time = 55152];
	      Float64 lat[lat = 510];
	      Float64 lon[lon = 1068];
      } tasmax;
      Grid {
	  Array:
	      Int16 tasmin[time = 55152][lat = 510][lon = 1068];
	  Maps:
	      Float64 time[time = 55152];
	      Float64 lat[lat = 510];
	      Float64 lon[lon = 1068];
      } tasmin;
      Float64 time[time = 55152];
  } pr%2Btasmax%2Btasmin_day_BCSD%2BANUSPLIN300%2BMPI-ESM-LR_historical%2Brcp26_r3i1p1_19500101-21001231%2Eh5;

You can see the the response clearly describes all variable which are available from the dataset as well as their dimensionality and dimension lengths. To get attribute information for the dataset, you can make a DAS request as such: ::

  james@basalt ~ $ wget --output-document=- http://tools.pcic.uvic.ca/dataportal/bcsd_downscale_canada/catalog/pr+tasmax+tasmin_day_BCSD+ANUSPLIN300+MPI-ESM-LR_historical+rcp26_r3i1p1_19500101-21001231.h5.das 2> /dev/null
  Attributes {
      NC_GLOBAL {
	  String comment "Spatial dissagregation based on tasmin/tasmax; quantile mapping extrapolation based on delta-method";
	  String target_references "McKenney, D.W., Hutchinson, M.F., Papadopol, P., Lawrence, K., Pedlar, J.,
  Campbell, K., Milewska, E., Hopkinson, R., Price, D., and Owen, T.,
  2011. Customized spatial climate models for North America.
  Bulletin of the American Meteorological Society, 92(12): 1611-1622.

  Hopkinson, R.F., McKenney, D.W., Milewska, E.J., Hutchinson, M.F.,
  Papadopol, P., Vincent, L.A., 2011. Impact of aligning climatological day
  on gridding daily maximum-minimum temperature and precipitation over Canada.
  Journal of Applied Meteorology and Climatology 50: 1654-1665.";
	  String driving_experiment "MPI-ESM-LR, historical+rcp26, r3i1p1";
	  String target_dataset "ANUSPLIN interpolated Canada daily 300 arc second climate grids";
	  String creation_date "2013-03-27T23:45:46Z";
	  String frequency "day";
	  String references "Wood, A.W., Leung, L.R., Sridhar, V., and Lettenmaier, D.P., 2004.
  Hydrologic implications of dynamical and statistical approaches to
  downscaling climate model outputs. Climatic Change, 62: 189-216.";
	  String driving_experiment_name "historical, RCP2.6";
	  String target_institute_id "CFS-NRCan";
	  String title "Bias Correction/Spatial Disaggregation (BCSD) downscaling model output for Canada";
	  String source "Downscaled from MPI-ESM-LR historical+rcp26 r3i1p1 to ANUSPLIN300 gridded observations";
	  String version "1";
	  String driving_model_ensemble_member "r3i1p1";
	  String realization "1";
	  String driving_institute_id "MPI-M";
	  String driving_model_id "MPI-ESM-LR";
	  String institute_id "PCIC";
	  String product "output";
	  String target_version "canada_daily_standard_grids";
	  String target_history "obtained: 2 April 2012, 14 June 2012, and 30 January 2013";
	  String target_id "ANUSPLIN300";
	  String modeling_realm "atmos";
	  String institution "Pacific Climate Impacts Consortium (PCIC), Victoria, BC, www.pacificclimate.org";
	  String target_contact "Pia Papadopol (pia.papadopol@nrcan-rncan.gc.ca)";
	  String driving_institution "Max-Planck-Institut fur Meteorologie (Max Planck Institute for Meteorology)";
	  String target_institution "Canadian Forest Service, Natural Resources Canada";
	  String Conventions "CF-1.4";
	  String contact "Alex Cannon (acannon@uvic.ca)";
	  String history "created: Wed Mar 27 15:45:46 2013";
      }
      DODS_EXTRA {
	  String Unlimited_Dimension "time";
      }
      lat {
	  String long_name "latitude";
	  String standard_name "latitude";
	  String NAME "lat";
	  String units "degrees_north";
	  String CLASS "DIMENSION_SCALE";
	  String axis "Y";
      }
      lon {
	  String long_name "longitude";
	  String standard_name "longitude";
	  String NAME "lon";
	  String units "degrees_east";
	  String CLASS "DIMENSION_SCALE";
	  String axis "X";
      }
      pr {
	  Int16 _FillValue -32768;
	  Float32 scale_factor 0.025;
	  Float32 add_offset 750;
	  String long_name "Precipitation";
	  String standard_name "precipitation_flux";
	  String cell_methods "time: mean";
	  String units "mm day-1";
	  Int16 missing_value -32768;
      }
      tasmax {
	  Int16 _FillValue -32768;
	  Float32 scale_factor 0.01;
	  Float32 add_offset 0;
	  String long_name "Daily Maximum Near-Surface Air Temperature";
	  String standard_name "air_temperature";
	  String cell_methods "time: maximum";
	  String units "degC";
	  Int16 missing_value -32768;
      }
      tasmin {
	  Int16 _FillValue -32768;
	  Float32 scale_factor 0.01;
	  Float32 add_offset 0;
	  String long_name "Daily Minimum Near-Surface Air Temperature";
	  String standard_name "air_temperature";
	  String cell_methods "time: minimum";
	  String units "degC";
	  Int16 missing_value -32768;
      }
      time {
	  String long_name "time";
	  String standard_name "time";
	  String NAME "time";
	  String units "days since 1950-01-01 00:00:00";
	  String calendar "gregorian";
	  String CLASS "DIMENSION_SCALE";
      }
  }

Such a request would useful for retreiving data units in advance of downloading the data or for filtering according to driving model or institute.

Downloading the actual data values themselves is also done with a DAP request. There are a couple differences, however. First, to download data, the client must be logged in via OpenID. Secondly, the URL template for the request is http://tools.pacificclimate.org/dataportal/[ensemble]/data/[dataset_id].[format_extension]?[dap_selection]

*format_extension* can be one of: nc, csv, ascii. 

To construct a proper DAP selection, please refer to the `DAP specification <http://www.opendap.org/pdf/ESE-RFC-004v1.2.pdf>`_. For example, if you wanted to download the first two timesteps and an 11 by 11 spatial region of the BCSD downscaling data you could make a request as follows: ::

  james@basalt ~ $ wget --output-document=- --header "Cookie: beaker.session.id=e87ac369cd044bc38fda65e10bf6dbce" http://tools.pcic.uvic.ca/dataportal/bcsd_downscale_canada/data/pr+tasmax+tasmin_day_BCSD+ANUSPLIN300+MPI-ESM-LR_historical+rcp26_r3i1p1_19500101-21001231.h5.csv?tasmin[0:1][200:210][200:210] 2> /dev/null
  tasmin.tasmin
  [[-1499, -1490, -1468, -1474, -1440, -1395, -1377, -1363, -1386, -1360, -1335], [-1447, -1404, -1401, -1395, -1381, -1389, -1355, -1363, -1367, -1328, -1302], [-1499, -1490, -1500, -1441, -1346, -1354, -1332, -1314, -1309, -1292, -1285], [-1505, -1469, -1475, -1426, -1370, -1366, -1344, -1345, -1307, -1292, -1286], [-1429, -1433, -1395, -1366, -1367, -1348, -1329, -1314, -1299, -1294, -1284], [-1452, -1418, -1397, -1393, -1366, -1338, -1327, -1297, -1289, -1285, -1288], [-1393, -1401, -1378, -1371, -1349, -1345, -1311, -1293, -1280, -1287, -1312], [-1422, -1357, -1347, -1337, -1323, -1319, -1297, -1281, -1276, -1312, -1314], [-1421, -1388, -1374, -1361, -1340, -1324, -1293, -1277, -1272, -1299, -1295], [-1395, -1384, -1365, -1346, -1331, -1311, -1287, -1274, -1277, -1277, -1282], [-1398, -1376, -1355, -1335, -1320, -1297, -1277, -1286, -1289, -1283, -1271]]
  [[-2126, -2116, -2087, -2101, -2051, -1976, -1950, -1930, -1980, -1940, -1899], [-2044, -1971, -1974, -1970, -1950, -1975, -1916, -1940, -1954, -1884, -1833], [-2137, -2128, -2150, -2060, -1885, -1914, -1875, -1843, -1840, -1805, -1796], [-2151, -2100, -2116, -2042, -1947, -1947, -1913, -1923, -1846, -1813, -1808], [-2030, -2045, -1986, -1937, -1950, -1918, -1888, -1865, -1835, -1830, -1811], [-2075, -2025, -1994, -1996, -1954, -1906, -1895, -1830, -1818, -1814, -1829], [-1975, -2000, -1965, -1961, -1927, -1930, -1867, -1829, -1800, -1828, -1894], [-2033, -1911, -1901, -1894, -1872, -1878, -1839, -1808, -1797, -1895, -1903], [-2034, -1985, -1970, -1954, -1922, -1899, -1838, -1804, -1794, -1873, -1868], [-1993, -1981, -1955, -1926, -1906, -1874, -1829, -1804, -1818, -1821, -1838], [-2000, -1968, -1935, -1901, -1883, -1840, -1805, -1845, -1858, -1845, -1812]]
  tasmin.time
  0.0
  1.0

Note that for this example the temperature values are all packed integer values and to obtain the proper value you may need to apply a floating point offset and/or scale factor which are available in the DAS response and the netcdf data response.

Frequently Asked Questions
--------------------------

Why do I have to login and what is OpenID?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

A user login is required to download data so that we can track usage and gauge the degree to which we are providing effective services for our users. We collect the e-mail addresses of users for the sole purpose of contacting you in the unlikely event that major errors are found in the data or when major changes to the data in the portal are made. E-mail addresses are the only personal information that PCIC will gather and will be kept secure.

`OpenID <http://openid.net/get-an-openid/what-is-openid/>`_ allows you to use an existing account to sign in to multiple websites, without needing to create new passwords. For the user, OpenID provides the advantage that you can use a single account to log in to multiple websites.  For PCIC, OpenID provides the advantage that we do not have to maintain identity information and can minimize the personal information that we collect and store.

What is a NetCDF file and how do I use it?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

NetCDF is a format for storing and tranfering multidimensional data and all of its associated metadata. It's designed specifically for handing structured earth science data and climate model output. While PCIC's users occasionally balk at it for not being "user friendly", it's a roughly equivalent time investment for learning how to use it versus figuring out how to parse CSV output and reinstate all of the data structures that get lost in translation.

There is a fairly complete list of `NetCDF software <http://www.unidata.ucar.edu/software/netcdf/software.html>`_ available on Unidata's website. We often use the program `ncview <http://www.unidata.ucar.edu/software/netcdf/software.html#ncview>`_ to examine data. It's old, simple and crashes a bit, but it usually does a fine job of simple visualization on the desktop. There's also the `netcdf_tools <http://www.unidata.ucar.edu/software/netcdf/software.html#netcdf_tools>`_ which are basic command line tools to dump data, look at attributes, etc. For more sophisticated use, we frequently use `GDAL <http://www.unidata.ucar.edu/software/netcdf/software.html#GDAL>`_, and the `Python <http://www.unidata.ucar.edu/software/netcdf/software.html#Python>`_ and `R <http://www.unidata.ucar.edu/software/netcdf/software.html#R>`_ interfaces.

How do I interpret this climate data? (a.k.a, What is CF Metadata?)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If you download our data in NetCDF format, you will also receive all of the accompanying metadata. The metadata should comply with international conventions regarding how to describe and interpret climate and forecast data. These conventions are known as the *CF Metadata Conventions*. A full description of the conventions is beyond the scope of this FAQ, but all the details that you could as for can be found `here <http://cf-pcmdi.llnl.gov/>`_.
 
Why can't I download climate model output in Excel?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Excel and spreadsheets in general are simply not designed to handle the large amounts of bulk data that come from climate models. Climate model output is multidimensional (lat x lon x time and sometimes x level) and Excel has no real concept of dimensionality. Excel *does* have rows and columns and as such it is common to represent two dimensional data with Excel, however, it is not designed for handling data that has three or four dimensions. Excel simply has a different data model than does climate model output.

Additionally, the size of data which the Excel format can handle is limited compared to what is required by climate model output. An Excel 2010 Worksheet is `limited to 1,048,576 rows by 16,384 columns <http://office.microsoft.com/en-ca/excel-help/excel-specifications-and-limits-HP010342495.aspx?CTT=5&origin=HP005199291>`_. Compare this to the data requirements of our Canada-wide downscaled climate coverage which has a spatial extent of 510x1068 cells (i.e. 544,680 cells) and a temporal extent of 55,152 timesteps. Niether the temporal extent, nor the spatial extent will fit within Excel's column limits. Even if we utilized each of the 17,179,869,184 availble cells (ignoring and throwing away all of the data's structure), we would not have enough cells to store the dataset's 30,040,191,360 points. Excel *can* support multiple worksheets in a workbook, but the number of worksheets is limited by the memory of the system on which it is running. For the majority of standard desktops, this would be well short of the memory required to store climate model output.

To summarize, Excel is not designed for multi-dimensional data making it incovenient and technically impossible.

Can I download climate model output in a "GIS-friendly" format?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This question is related to the above question about Excel. Like spreadsheets, most (all?) GIS software packages are designed to display data in only two coordinate dimensions (i.e. a map). Suppose that you download daily data for a ten year period, how would your GIS software visualize the resulting 3600 layers? GIS software packages are not designed for this purpose. In general, you're going to need to do additional, needs-specific processing before you can create climate maps with your GIS software.

All that said, if your GIS software can speak WMS and you want to map individual time steps, please review our Power user HOWTO.

When I try to download PRISM data, I'm told that the map "Cannot resolve selection to data grid". Why?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You see something like this?

.. figure:: images/prism_res_too_high.png

This is an interesting problem and it turns out that it's because our PRISM data is actually *too* fine of a resolution. When you're zoomed out on the map, multiple pixels/grid cells of the PRISM raster are actually represented by a single screen pixel. For the web application to request the data subset from the data server, it has to be able to map a screen pixel (i.e. where you click when you select your rectangle) to a data pixel. If there are multiple data pixels per screen pixel (i.e. when you're zoomed out), then it's ambiguous and not determinable. For you to solve this, it *should* be sufficient to just zoom one or two steps. This issue only arises when your selection extends beyond the data area (and only beyond the southern and eastern extent). That's because to do the geographic clipping, the application has to reference yet another coordinate system (geographic). So in that case, the application has to reconcile three different coordinate systems (geographic, screen pixels, and PRISM grid cells) and there's not always enough information to resolve them.


Where can I report a bug or request a feature?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Good question. In the future, we will accept bug reports through our `Redmine <http://www.redmine.org/>`_ project management software, but it's not yet ready. For now just `send us an email <mailto:climate@pacificclimate.org>`_, and please try to follow guidelines for `writing *effective* bug reports <http://www.chiark.greenend.org.uk/~sgtatham/bugs.html>`_.
