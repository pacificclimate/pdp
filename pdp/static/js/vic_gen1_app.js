/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, getCatalog, init_vic_map, processNcwmsLayerMetadata, getVICControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

"use strict";

// globals
var catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer,
        dlLink, mdLink;

    map = init_vic_map();
    loginButton = pdp.init_login('login-div');

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    document.getElementById("pdp-controls").appendChild(getVICControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    // Data Download Link
    dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'sm', '0:54787', '0:163', '0:215');
    $('#data-format-selector').change(
        function (evt) {
            dlLink.onExtensionChange($(this).val());
        }
    );
    ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);
    selectionLayer.events.register('featureadded', dlLink, dlLink.onBoxChange);
    dlLink.register($('#download-timeseries'), function (node) {
        node.attr('href', dlLink.getUrl());
    }
                   );
    dlLink.trigger();
    $('#download-timeseries').click(loginButton, pdp.checkAuthBeforeDownload);

    // Metadata/Attributes Download Link
    mdLink = new MetadataDownloadLink($('#download-metadata'), ncwmsLayer, undefined);
    ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
    mdLink.register($('#download-metadata'), function (node) {
        node.attr('href', mdLink.getUrl());
    }
                   );
    mdLink.trigger();

    // Date picker event for both links
    $("[class^='datepicker']").change(
        function (evt) {
            dlLink.onTimeChange();
        }
    );

    getCatalog(function (data) {
        catalog = dlLink.catalog = mdLink.catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
        // Set the data URL as soon as it is available
        dlLink.onLayerChange();
        mdLink.onLayerChange();
    });
});
