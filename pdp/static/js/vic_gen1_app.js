// Globals ensemble_name, current_dataset, ncwmsCapabilities

$(document).ready(function() {
    map = init_vic_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    getCatalog(function (data) { catalog = data;
				 processNcwmsLayerMetadata(ncwmsLayer);
			       });

    var selector = document.getElementById("pdp-controls").appendChild(getVICControls(pdp.ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    function callDownload() {
        download(type, map, selectionLayer, ncwmsLayer, 'data');
    };
    function showDownloadLink() {
        download(type, map, selectionLayer, ncwmsLayer, 'link');
    };
    function callDownloadMetadata() {
        download('das', map, selectionLayer, ncwmsLayer, 'metadata');
    };
    var type;

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
