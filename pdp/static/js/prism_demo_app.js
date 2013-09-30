$(document).ready(function() {
    map = init_prism_map();
    amenu.open(ncwms.params.LAYERS, true);
    amenu.init();
    
    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls());
    var download = document.getElementById("pdp-controls").appendChild(getPRISMDownloadOptions());

});
