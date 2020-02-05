/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, init_hydro_stn_map, getHydroStnControls, addToSidebar, removeFromSidebar, show_permalinks*/
/*
 * This front end provides downloading of routed streamflow data. A user selects
 * one or more stations using the map or text search, then is able to download
 * a CSV file for each station. The file has one column for each model+scenario
 * timeseries for the station.
 * 
 * Its UI is somewhat unique amoung the data portals, as point datasets are
 * selected in a different process than raster datasets.
 *
 * METADATA
 * As routed streamflow data cannot (yet) be stored in the metadata database,
 * this portal is unable to have a single source of metadata truth about what
 * files are available and what data is in them, unlike the raster portals.
 * Routed streamflow metadata unfortunately has two distinct sources, and
 * they must be kept in agreement.
 * 
 * First, there is the station metadata, which describes each physical location
 * for which data is available. This metadata is stored in a .CSV file accessed
 * directly by the javascript front end.
 * 
 * Second, there is file metadata, which describes where to find the files.
 * This metadata is stored in a .YAML file accessible by the backend and served
 * as catalog.json. The backend will serve every file in a specified directory.
 *
 * There is one datafile for each station, but there is no programmatic way to
 * enforce or check this at present - the portal just assumes everything is where
 * it is expected to be. Programmer beware!
 *
 * The frontend gets a filename for each station from the station metadata format,
 * then assumes that there is a file at data_root/portal_name/filename for user
 * download. The directory the backend serves data from should contain a file named
 * filename, so that the backend can serve the data the frontend assumes is present.
 *
 * DATA COLLECTIONS
 * This portal serves two different collections of data - routed flows using CMIP3
 * data as an input, and routed flows using CMIP5 data as an input. The two data
 * collections each draw upon their own station metadata and file metadata, but
 * otherwise behave identically.
 * Which data collection is displayed is a function of the URL used to access this
 * portal, and is determined with the isArchivePortal() function.
 */


(function ($) {
    "use strict";

    function hydro_stn_app() {
        var map, mapProj, controls, dataArray,
            stnLayer, searchData;

        if (window.shittyIE) {
            alert("This portal does not support IE8. Please upgrade your browser or use an alternative.");
            return;
        }
        if(isArchivePortal()) {
        	console.log("this is an archive portal.");
        }
        
        window.map = map = init_hydro_stn_map();
        mapProj = map.getProjectionObject();

        controls = getHydroStnControls();
        document.getElementById("pdp-controls").appendChild(controls);

        function selection_callback(event, ui) {
            map.toggleSelectFeatureByFid(ui.item.value);
            $('#searchBox').val('');
            return false;
        }
        $(controls.sBox).autocomplete({
            select: selection_callback,
            delay: 100,
            minLength: 2
        });

        // Set up station layer events
        stnLayer = map.getStnLayer();
        stnLayer.events.on({
            'featureselected': function (feature) {
                addToSidebar(feature.feature.fid, dataArray);
            },
            'featureunselected': function (feature) {
                removeFromSidebar(feature.feature.fid);
            }
        });

        dataServices.getRoutedFlowMetadata(isArchivePortal()).done(function (data) {
            var inProj = new OpenLayers.Projection("EPSG:4326");

            dataArray = $.csv.toObjects(data);
            console.log(dataArray);

            $(dataArray).each(function (idx, row) {
                var parser, pt, feature;

                row.idx = idx;
                parser = document.createElement('a');
                parser.href = pdp.data_root + "/" + dataURL() + "/" + row.FileName;
                row.url = parser.href;
                pt = new OpenLayers.Geometry.Point(
                    parseFloat(row.Longitude),
                    parseFloat(row.Latitude)
                ).transform(inProj, mapProj);
                feature = new OpenLayers.Feature.Vector(pt);
                feature.fid = idx;
                stnLayer.addFeatures(feature);
            });

            searchData = $.map(dataArray, function (x) {
                return { label: x.StationName, value: x.idx };
            }).concat($.map(dataArray, function (x) {
                return { label: x.SiteID, value: x.idx };
            }));

            // Adds data to the search box.
            $('#searchBox').autocomplete(
                "option",
                "source",
                searchData
            );
        });

        $("#permalink").click(function () {
            var fids, url_list;
            fids = map.getSelectedFids();

            url_list = $.map(fids, function (fid) {
                return dataArray[fid].url;
            });
            show_permalinks(url_list, 'ascii');
        });
        
                // the archive and current portals link to eachother.
        if(isArchivePortal()) {
            //archive portal. link to new portal, add archive disclaimer.
            addPortalLink("hydro_stn_cmip5", "Main Modeled Streamflow Portal");
            document.getElementById("pdp-controls").appendChild(getArchiveDisclaimer());
        } else {
        	// new data portal; link to old one.
        	addPortalLink("hydro_stn_archive", "Archive Modeled Streamflow Portal");
        }
    }

    condExport(module, hydro_stn_app, 'hydro_stn_app');

    $(document).ready(hydro_stn_app);
})(jQuery);