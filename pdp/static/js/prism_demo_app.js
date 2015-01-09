/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, init_prism_map, download, getCatalog, getPRISMControls, getRasterDownloadOptions*/

"use strict";

// Globals
var ensemble_name, current_dataset, ncwmsCapabilities, catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, type;

    map = init_prism_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    getCatalog(function (data) {catalog = data; });

    document.getElementById("pdp-controls").appendChild(getPRISMControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(false));

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

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
