/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, getCatalog, download, init_vic_map, processNcwmsLayerMetadata, getVICControls, getRasterDownloadOptions*/

"use strict";

// globals
var catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, type;

    map = init_vic_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    getCatalog(function (data) {
        catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
    });

    document.getElementById("pdp-controls").appendChild(getVICControls(pdp.ensemble_name));
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
