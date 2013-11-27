// Globals ensemble_name, current_dataset, ncwmsCapabilities
"use strict";

var catalog;
var ncwmsCapabilities;

$(document).ready(function() {
    var map = init_raster_map();
    var loginButton = init_login("login-div");
    checkLogin(loginButton);

    var ncwmsLayer = map.getClimateLayer();
    var selectionLayer = map.getSelectionLayer();

    var catalogUrl = pdp.app_root + "/" + pdp.ensemble_name + "/catalog/catalog.json";
    var request = $.ajax(catalogUrl, { dataType: "json"} );
    request.then(function(data) {
        catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
    });

    document.getElementById("pdp-controls").appendChild(getRasterControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions());

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer);
    }
    var type;
    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val();
        checkLogin(loginButton, callDownload, function() {alert("Please log in before downloading data");});
    });

});
