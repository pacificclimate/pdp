$(document).ready(function() {
	ensemble_name = 'canada_map';
	map = init_raster_map();
    init_login('login-div');

    var selector = document.getElementById("pdp-controls").appendChild(getRasterControls());
    var download = document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions());

});
