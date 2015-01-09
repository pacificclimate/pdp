/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map, processNcwmsLayerMetadata, getRasterControls, getRasterDownloadOptions, download*/

"use strict";

// Globals
var ensemble_name, current_dataset, ncwmsCapabilities, catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, catalogUrl, request, type;

    map = init_raster_map();
    loginButton = pdp.init_login("login-div");
    pdp.checkLogin(loginButton);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    catalogUrl = "../catalog/catalog.json";
    request = $.ajax(catalogUrl, {dataType: "json"});
    request.then(function (data) {
        catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
    });

    document.getElementById("pdp-controls").appendChild(getRasterControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer, 'data');
    }
    function showDownloadLink() {
        download(type, map, selectionLayer, ncwmsLayer, 'link');
    }
    function callDownloadMetadata() {
        download('das', map, selectionLayer, ncwmsLayer, 'metadata');
    }
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
