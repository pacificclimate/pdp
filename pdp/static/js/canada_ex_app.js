/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map, processNcwmsLayerMetadata, 
getRasterControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

/*
 * This front end displays the BCSD/BCCAQ version 2 data.
 *
 * BCCAQ version 2:
 *    backend: bccaq2_downscale.py
 *    url_base: downscaled_gcms
 *    ensemble: bccaq_version_2
 *
 */

(function ($) {
    "use strict";

    function canada_ex_app() {
        var map, ncwmsLayer, selectionLayer, catalogUrl, catalog_request, catalog,
            dlLink, mdLink, capabilities_request, ncwms_capabilities;

        map = init_raster_map({
            variable: "tasmax",
            dataset: "tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada",
            timestamp: "2000-01-01T12:00:00.00Z"
        });

        ncwmsLayer = map.getClimateLayer();
        selectionLayer = map.getSelectionLayer();

        catalog_request = dataServices.getCatalog();

        capabilities_request = dataServices.getNCWMSLayerCapabilities(ncwmsLayer);

        document.getElementById("pdp-controls")
            .appendChild(getRasterControls(pdp.ensemble_name));
        document.getElementById("pdp-controls")
            .appendChild(getRasterDownloadOptions('first', 'last'));

        // Data Download Link
        dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'tasmax', '0:55152', '0:510', '0:1068');
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

    }

    condExport(module, canada_ex_app, 'canada_ex_app');

    $(document).ready(canada_ex_app);
})(jQuery);
