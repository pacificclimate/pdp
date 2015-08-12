/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, init_prism_map, getCatalog, getPRISMControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

"use strict";

// Globals
var ensemble_name, ncwmsCapabilities, catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, dlLink, mdLink;

    map = init_prism_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    document.getElementById("pdp-controls").appendChild(getPRISMControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(false));

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    // Ensure that climatology_bounds are included in non-aig data downloads
    function setBoundsInUrlTemplate() {
        if (dlLink.ext === 'aig') {
            dlLink.url_template = '{dl_url}.{ext}?{varname}[{trange}][{yrange}][{xrange}]&';
        } else {
            dlLink.url_template = '{dl_url}.{ext}?climatology_bounds,{varname}[{trange}][{yrange}][{xrange}]&';
        }
        dlLink.trigger();
    }

    // Data Download Link
    dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'pr', '0:13', '0:1680', '0:3241');
    $('#data-format-selector').change(
        function (evt) {
            dlLink.onExtensionChange($(this).val());
        }
    ).change(setBoundsInUrlTemplate);
    ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);
    ncwmsLayer.events.register('change', dlLink, dlLink.onBoxChange);
    selectionLayer.events.register('featureadded', dlLink, dlLink.onBoxChange);
    dlLink.register($('#download-timeseries'), function (node) {
        node.attr('href', dlLink.getUrl());
    });
    setBoundsInUrlTemplate();
    dlLink.trigger();
    $('#download-timeseries').click(loginButton, pdp.checkAuthBeforeDownload);

    // Metadata/Attributes Download Link
    mdLink = new MetadataDownloadLink($('#download-metadata'), ncwmsLayer, undefined);
    ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
    mdLink.register($('#download-metadata'), function (node) {
        node.attr('href', mdLink.getUrl());
    });

    // FIXME: This needs to have error handling and this is horrible
    getCatalog(
        function (data) {
            catalog = dlLink.catalog = mdLink.catalog = data;
            // Set the data URL as soon as it is available
            dlLink.onLayerChange();
            mdLink.onLayerChange();
        }
    );

});
