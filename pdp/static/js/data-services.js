(function($) {
    "use strict";

    function getCatalog() {
        return $.ajax("../catalog/catalog.json", {dataType: "json"});
    }


    function getMetadata(layer_id) {
        var layer_params = {
            "id": layer_id.split('/')[0],
            "var": layer_id.split('/')[1]
        };

        return $.ajax({
            url: "../metadata.json?request=GetMinMaxWithUnits",
            data: layer_params
        });
    }


    function getRasterAccordionMenuData(ensembleName) {
        var url = '../menu.json?ensemble_name=' + ensembleName;
        return $.ajax(url, {dataType: "json"});
    }


    function getNCWMSLayerCapabilities(ncwms_layer) {

        // FIXME: this .ajax logic doesn't really work in all cases
        // What we really want is the fail() handler to _resolve_ the status,
        // and then have another fail() fallthrough handler .That is impossible, however.
        // see: http://domenic.me/2012/10/14/youre-missing-the-point-of-promises/

        var deferred = $.Deferred();

        var params = {
            REQUEST: "GetCapabilities",
            SERVICE: "WMS",
            VERSION: "1.1.1",
            DATASET: ncwms_layer.params.LAYERS.split("/")[0]
        };

        $.ajax({
            url: ncwms_layer.url,
            data: params,
        })
        .fail(handle_ie8_xml)
        .always(function (response, status, jqXHR) {
            deferred.resolve($(jqXHR.responseXML));
        });

        return deferred.promise();
    }


    function getNcwmsLayerDDS(layerUrl) {
        return $.ajax({
            url: (layerUrl + ".dds?time")
        })
    }


    function getNcwmsLayerDAS(layerUrl) {
        return $.ajax({
            url: (layerUrl + ".das")
        })
    }


    function getStationCount(data, success) {
        return $.ajax({
            url: '../count_stations',
            data: data,
            type: 'GET',
            dataType: 'json',
            success: success
        });
    }


    function getRecordLength(data, success) {
        return $.ajax({
            url: '../record_length',
            data: data,
            type: 'GET',
            dataType: 'json',
            success: success
        });
    }

	// returns a list of station locations and names from a CSV file.
	// there are two such lists, one for the current CMIP5 hydro station
	// data, and the other for the archive CMIP3 data 
    function getRoutedFlowMetadata(isArchivePortal) {
    	const resource = isArchivePortal ? 
    						"routed_flow_metadatav4" :
    						"hydro_stn_cmip5_metadata";
        return $.ajax(pdp.app_root + "/csv/" + resource + ".csv");
    }


    function layerDataUrl(ncwmsLayer, catalog) {
        // Return OpENDAP data URL given an ncWMS layer and layer catalog.
        // TODO: Use this fn wherever the URL is computed in code.
        const datasetName = ncwmsLayer.params.LAYERS.split('/')[0];
        return catalog[datasetName];
    }


    function getLatLonValues(ncwmsLayer, catalog) {
        // Get the latitude and longitude values associated with an ncWMS layer
        // These values are retrieved using the OpENDAP data service that also
        // serves the actual data downloads. In order to form the URL for this
        // service, we need the layer catalog, passed in as `catalog`.

        function convertResponse(data) {
            // Convert text response to a JS object.
            // Response comes as pairs of lines, each terminated by a newline.
            // First line in pair contains name of variable. Second contains
            // values, enclosed in brackets and separated by ', ' (i.e., a JSON
            // array).
            const lines = data.split("\n");
            const result = {};
            if (lines[0] === "Dataset {") { // Response comes from THREDDS
                // Ignore header information
                for (let i = 5; i < lines.length - 1; i += 3) {
                    // Only use coordinate name as key
                    result[lines[i].substring(0,3)] = JSON.parse("[" + lines[i + 1] + "]");
                }
            }
            else { // Response comes from PyDAP
                for (let i = 0; i < lines.length - 1; i += 2) {
                    result[lines[i]] = JSON.parse(lines[i + 1]);                                   }
            }
            return result;
        }

        return $.ajax({
            url: `${layerDataUrl(ncwmsLayer, catalog)}.ascii?lat,lon`,
            dataType: 'text',
            dataFilter: convertResponse,
        });
    }


    condExport(module, {
        getCatalog: getCatalog,
        getMetadata: getMetadata,
        getRasterAccordionMenuData: getRasterAccordionMenuData,
        getNCWMSLayerCapabilities: getNCWMSLayerCapabilities,
        getNcwmsLayerDDS: getNcwmsLayerDDS,
        getNcwmsLayerDAS: getNcwmsLayerDAS,
        getStationCount: getStationCount,
        getRecordLength: getRecordLength,
        getRoutedFlowMetadata: getRoutedFlowMetadata,
        getLatLonValues: getLatLonValues,
        layerDataUrl: layerDataUrl,
    }, 'dataServices');
})(jQuery);