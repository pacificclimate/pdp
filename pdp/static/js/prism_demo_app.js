// Globals ensemble_name, current_dataset, ncwmsCapabilities

$(document).ready(function() {
    map = init_prism_map();
    loginButton = pdp.auth.init_login('login-div');
    pdp.auth.checkLogin(loginButton);

    pdp.download.getCatalog(function (data) { catalog = data});

    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls(pdp.ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(pdp.controls.getRasterDownloadOptions(false));

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
    $("#download-timeseries").click(function(){
        type = $('select[name="data-format"]').val()
        callDownload();
    });
    $("#permalink").click(function(){
	type = $('select[name="data-format"]').val();
	showDownloadLink();
    });
    $("#metadata").click(callDownloadMetadata);

});
