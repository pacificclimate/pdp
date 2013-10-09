// Globals current_dataset, selectionLayer, ncwmsCapabilities

$(document).ready(function() {
    ensemble_name = 'bc_prism_demo';

    map = init_prism_map();
    loginButton = init_login('login-div');
    
    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls(ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getPRISMDownloadOptions());

    ncwms_layer = map.getLayersByName('Climate raster')[0];

    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val()
        checkLogin(loginButton, download(type, map, selectionLayer, ncwms_layer), function() {alert('Please log in before downloading data');})
    });

});
