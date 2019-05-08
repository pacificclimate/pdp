/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, init_vic_map, processNcwmsLayerMetadata, getVICControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

"use strict";

$(document).ready(function () {
    var map, ncwmsLayer, selectionLayer, catalogUrl, catalog_request, catalog,
        dlLink, mdLink, capabilities_request, ncwms_capabilities;

    map = init_vic_map();

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    catalog_request = dataServices.getCatalog();

    capabilities_request = dataServices.getNCWMSLayerCapabilities(ncwmsLayer);

    document.getElementById("pdp-controls").appendChild(getVICControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    // Data Download Link
    dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'sm', '', '', '');
    $('#data-format-selector').change(
        function (evt) {
            dlLink.onExtensionChange($(this).val());
        }
    );

    ncwmsLayer.events.register('change', dlLink, function () {
        processNcwmsLayerMetadata(ncwmsLayer, catalog);
        capabilities_request = dataServices.getNCWMSLayerCapabilities(ncwmsLayer);
        capabilities_request.done(function(data) {
            ncwms_capabilities = data;
            if (selectionLayer.features.length > 0) {
                dlLink.onBoxChange({feature: selectionLayer.features[0]}, ncwms_capabilities);
            }
        });
    });
    ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);

    selectionLayer.events.register('featureadded', dlLink, function (selection){
        capabilities_request.done(function(data) {
            ncwms_capabilities = data;
            dlLink.onBoxChange(selection, data);
        });
    });

    dlLink.register($('#download-timeseries'), function (node) {
        node.attr('href', dlLink.getUrl());
    }
                   );
    dlLink.trigger();

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

    capabilities_request.done(function (data) {
        ncwms_capabilities = data;
    });
    catalog_request.done(function (data) {
        catalog = dlLink.catalog = mdLink.catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer, catalog);
        // Set the data URL as soon as it is available
        dlLink.onLayerChange();
        mdLink.onLayerChange();
    });
});
