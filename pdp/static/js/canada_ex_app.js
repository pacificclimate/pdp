$(document).ready(function() {
    map = init_raster_map();
    var selector = document.getElementById("pdp-controls").appendChild(getRasterControls());
    var download = document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions());

});
