// Globals ensemble_name, current_dataset, ncwmsCapabilities

$(document).ready(function() {
	map = init_raster_map();
    loginButton = init_login('login-div');
    checkLogin(loginButton);

    var ncwmsLayer = map.getClimateLayer();
    var selectionLayer = map.getSelectionLayer();

    var catalogUrl = app_root + '/' + ensemble_name + '/catalog/catalog.json';
    var request = $.ajax(catalogUrl, { dataType: 'json'} );
    var chained = request.then(function(data) {
        catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
    });

    var selector = document.getElementById("pdp-controls").appendChild(getRasterControls(ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions());

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer);
    }

    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val()
        checkLogin(loginButton, callDownload, function() {alert('Please log in before downloading data');});
    });

});
