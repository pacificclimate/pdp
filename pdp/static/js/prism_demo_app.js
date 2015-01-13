/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, init_prism_map, download, getCatalog, getPRISMControls, getRasterDownloadOptions, RasterDownloadLink*/

"use strict";

// Globals
var ensemble_name, current_dataset, ncwmsCapabilities, catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, dlLink, mdLink;

    map = init_prism_map();
    loginButton = pdp.init_login('login-div');
    pdp.checkLogin(loginButton);

    document.getElementById("pdp-controls").appendChild(getPRISMControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(false));

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    // Ensure that climatology_bounds are included in non-aig downloads
    function setBoundsInUrlTemplate() {
        if (this.ext === 'aig') {
            this.url_template = '{dl_url}.{ext}?{var_}[{trange}][{yrange}][{xrange}]&';
        } else {
            this.url_template = '{dl_url}.{ext}?climatology_bounds,{var_}[{trange}][{yrange}][{xrange}]&';
        }
    }

    dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', '', '0:13', ':', ':');
    $('#data-format-selector').change(
        function (evt) {
            dlLink.onExtensionChange($(this).val());
        }
    );
    ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);
    ncwmsLayer.events.register('change', dlLink, setBoundsInUrlTemplate);
    selectionLayer.events.register('featureadded', dlLink, dlLink.onBoxChange);
    dlLink.register($('#download-timeseries'), function (node) {
        node.attr('href', dlLink.getUrl());
    }
                   );
    dlLink.trigger();

    mdLink = new RasterDownloadLink($('#download-metadata'), ncwmsLayer, undefined, 'das', '', '0:13', ':', ':');
    mdLink.url_template = '{dl_url}.das?climatology_bounds,{var_}[{trange}][{yrange}][{xrange}]&';
    ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
    selectionLayer.events.register('featureadded', mdLink, mdLink.onBoxChange);
    mdLink.register($('#download-metadata'), function (node) {
        node.attr('href', mdLink.getUrl());
    }
                   );
    mdLink.trigger();

    // FIXME: This needs to have error handling and this is horrible
    getCatalog(
        function (data) {
            catalog = dlLink.catalog = mdLink.catalog = data;
        }
    );

});
