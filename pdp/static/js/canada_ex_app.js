// Globals current_dataset, selectionLayer, ncwmsCapabilities

$(document).ready(function() {
	ensemble_name = 'canada_map';

	map = init_raster_map();
    loginButton = init_login('login-div');

    var selector = document.getElementById("pdp-controls").appendChild(getRasterControls(ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions());

    ncwms_layer = map.getLayersByName('Climate raster')[0];

    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val()
        checkLogin(loginButton, download(type, map, selectionLayer, ncwms_layer), function() {alert('Please log in before downloading data');})
    });

});
