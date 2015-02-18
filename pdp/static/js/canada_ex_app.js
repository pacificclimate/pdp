/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map, processNcwmsLayerMetadata, getRasterControls, getRasterDownloadOptions, RasterDownloadLink*/

"use strict";

// Globals
var ensemble_name, current_dataset, ncwmsCapabilities, catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, catalogUrl, request, dlLink, mdLink;

    map = init_raster_map();
    loginButton = pdp.init_login("login-div");
    pdp.checkLogin(loginButton);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    catalogUrl = "../catalog/catalog.json";
    request = $.ajax(catalogUrl, {dataType: "json"});

    document.getElementById("pdp-controls").appendChild(getRasterControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    // Data Download Link
    dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'tasmax', '0:55152', '0:510', '0:1068');
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
    mdLink = new RasterDownloadLink($('#download-metadata'), ncwmsLayer, undefined, 'das', 'tasmax', '0:55152', '0:510', '0:1068');
    ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
    selectionLayer.events.register('featureadded', mdLink, mdLink.onBoxChange);
    mdLink.register($('#download-metadata'), function (node) {
        node.attr('href', mdLink.getUrl());
    }
                   );
    mdLink.trigger();

    // Date picker event for both links
    $("[class^='datepicker']").change(
        function (evt) {
            dlLink.onTimeChange();
            mdLink.onTimeChange();
        }
    );


    request.then(function (data) {
        catalog = dlLink.catalog = mdLink.catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
        // Set the data URL as soon as it is available
        dlLink.onLayerChange();
        mdLink.onLayerChange();
    });

});
