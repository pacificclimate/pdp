// Globals current_dataset, selectionLayer, ncwmsCapabilities

$(document).ready(function() {
    map = init_prism_map();
    amenu.init();

    ensemble_name = 'bc_prism_demo';
    $.ajax({'url': app_root + '/data/' + ensemble_name + '/catalog.json',
        'type': 'GET',
        'dataType': 'json',
        'success': function(data, textStatus, jqXHR) {
            catalog = data;
        }}
    );
    
    // TODO: This can cause some incorrect formatting in the menu...
    // current_layer = map.getLayersByName('Climate raster')[0];
    // amenu.open(current_layer.params.LAYERS, true);
    
    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls(ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getPRISMDownloadOptions());

    ncwms_layer = map.getLayersByName('Climate raster')[0];

    $("#download-timeseries").click(function(){
    	type = $('select[name="data-format"]').val()
   		download(type, map, selectionLayer, ncwms_layer);
    });
});
