// Globals ensemble_name, current_dataset, ncwmsCapabilities

$(document).ready(function() {
    map = init_vic_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    getCatalog(function (data) { catalog = data});

    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls(pdp.ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getPRISMDownloadOptions());

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer);
    }

    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val()
        callDownload();
    });

});
