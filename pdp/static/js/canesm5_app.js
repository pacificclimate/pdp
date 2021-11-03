/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map,
processNcwmsLayerMetadata, getRasterControls, getRasterDownloadOptions,
RasterDownloadLink, MetadataDownloadLink*/

/*
 * This front end displays the CanESM2 BCCAQ2 data.
 *    backend: bccaq2_canesm5.py
 *    url_base: downscaled_canesm5
 *    ensemble: bccaq2_canesm5
 *    map: canada_ex_map.js
 * This portal is identical to the CMIP6 BCCAQ2 portal, except for the
 * available data. It displays a collection of downscaled CanESM5 CMIP6
 * runs, instead of multiple models.
 */

(function ($) {
    "use strict";

    function canesm5_app() {
        var map, ncwmsLayer, selectionLayer, catalogUrl, catalog_request, catalog,
            dlLink, mdLink, capabilities_request, ncwms_capabilities;

        map = init_raster_map({
            variable: "tasmin",
            dataset: "tasmin_day_BCCAQv2_CanESM5_historical-ssp126_r1iippff_19500101-21001231_Canada",
            timestamp: "2000-01-01"
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

    condExport(module, canesm5_app, 'canesm5_app');

    $(document).ready(canesm5_app);
})(jQuery);
