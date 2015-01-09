/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map, getOLClickHandler, processNcwmsLayerMetadata, getRasterControls, getRasterDownloadOptions, getPlotWindow, download, ddsToTimeIndex*/

"use strict";

// Globals
var catalog, ensemble_name, current_dataset, ncwmsCapabilities, ncwms;

$(document).ready(function () {
    var map, clickHandler, loginButton, ncwmsLayer, selectionLayer,
        catalogUrl, request, type;

    map = init_raster_map();
    clickHandler = getOLClickHandler(map);
    map.events.register('click', map, clickHandler);

    loginButton = pdp.init_login("login-div");
    pdp.checkLogin(loginButton);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    catalogUrl = "../catalog/catalog.json";
    request = $.ajax(catalogUrl, { dataType: "json"});
    request.then(function (data) {
        catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
    });

    document.getElementById("pdp-controls").appendChild(getRasterControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(false));
    document.getElementById("pdp-controls").appendChild(getPlotWindow());

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer, 'data');
    }
    function showDownloadLink() {
        download(type, map, selectionLayer, ncwmsLayer, 'link');
    }
    function callDownloadMetadata() {
        download('das', map, selectionLayer, ncwmsLayer, 'metadata');
    }

    function getTimeIndex(layer_name) {
        var layerUrl = catalog[layer_name.split('/')[0]],
            maxTimeReq = $.ajax({
                url: (layerUrl + ".dds?time").replace("/data/", "/catalog/")
            });
        $.when(maxTimeReq).done(function (maxTime, unitsSince) {
            var maxTimeIndex = ddsToTimeIndex(maxTime);
            ncwms.max_time_index = maxTimeIndex;
        });
    }

    ncwms.events.register('change', ncwms, getTimeIndex);

    $("#download-timeseries").click(function () {
        type = $('select[name="data-format"]').val();
        callDownload();
    });
    $("#permalink").click(function () {
        type = $('select[name="data-format"]').val();
        showDownloadLink();
    });
    $("#metadata").click(callDownloadMetadata);
});
