// Globals current_dataset, selectionLayer, ncwmsCapabilities

$(document).ready(function() {
    map = init_prism_map();
    amenu.init();

    // TODO: This can cause some incorrect formatting in the menu...
    // current_layer = map.getLayersByName('Climate raster')[0];
    // amenu.open(current_layer.params.LAYERS, true);
    
    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls());
    var downloader = document.getElementById("pdp-controls").appendChild(getPRISMDownloadOptions());

    ncwms_layer = map.getLayersByName('Climate raster')[0];

    $("#download-timeseries").click(function(){
    	type = $('select[name="data-format"]').val()
   		download(type, map, selectionLayer, ncwms_layer);
    });
});
