// Globals current_dataset, ncwmsCapabilities

$(document).ready(function() {
    ensemble_name = 'bc_prism_demo';

    map = init_prism_map();
    loginButton = init_login('login-div');
    checkLogin(loginButton);

    getCatalog(function (data) { catalog = data});

    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls(ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getPRISMDownloadOptions());

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer);
    }

    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val()
        checkLogin(loginButton, callDownload, function() {alert('Please log in before downloading data');});
    });

});
