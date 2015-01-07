// Globals ensemble_name, current_dataset, ncwmsCapabilities

$(document).ready(function() {
    map = init_prism_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    var catalog;

    var selector = document.getElementById("pdp-controls").appendChild(getPRISMControls(pdp.ensemble_name));
    var downloader = document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(false));

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    var dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', '', '0:13', ':', ':');
    dlLink.url_template = '{dl_url}.{ext}?climatology_bounds,{var_}[{trange}][{yrange}][{xrange}]&'; // FIXME: this won't work for aig
    $('#data-format-selector').change(function(evt) {dlLink.onExtensionChange($(this).val())});
    ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);
    selectionLayer.events.register('featureadded', dlLink, dlLink.onBoxChange);
    dlLink.register($('#download-timeseries'), function(node) {node.attr('href', dlLink.getUrl())});

    var mdLink = new RasterDownloadLink($('#download-metadata'), ncwmsLayer, undefined, 'das', '', '0:13', ':', ':');
    ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
    selectionLayer.events.register('featureadded', mdLink, mdLink.onBoxChange);
    mdLink.register($('#download-metadata'), function(node) {node.attr('href', mdLink.getUrl())});

    // FIXME: This needs to have error handling and this is horrible
    getCatalog(function (data) {catalog = dlLink.catalog = mdLink.catalog = data;});

});
