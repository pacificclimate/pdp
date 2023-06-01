/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, init_prism_map, processNcwmsLayerMetadata, getPRISMControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

(function ($) {
    "use strict";

    function prism_demo_app() {
        var map, ncwmsLayer, selectionLayer, catalogUrl, catalog_request, catalog,
            dlLink, mdLink, capabilities_request, ncwms_capabilities;

        map = init_prism_map(prism_demo_config.map);

        document.getElementById("pdp-controls")
            .appendChild(getPRISMControls(pdp.ensemble_name));
        document.getElementById("pdp-controls")
            .appendChild(getRasterDownloadOptions());

        ncwmsLayer = map.getClimateLayer();
        selectionLayer = map.getSelectionLayer();

        catalog_request = dataServices.getCatalog();

        capabilities_request = dataServices.getNCWMSLayerCapabilities(ncwmsLayer);

        function setBoundsInUrlTemplate() {
            dlLink.url_template = '{dl_url}.{ext}?climatology_bnds,{varname}[][{yrange}][{xrange}]&';
            dlLink.trigger();
        }

        // Data Download Link
        dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'pr', '', '0:1680', '0:3241');
        $('#data-format-selector').change(
            function (evt) {
                dlLink.onExtensionChange($(this).val());
            }
        ).change(setBoundsInUrlTemplate);

        ncwmsLayer.events.register('change', dlLink, function () {
            processNcwmsLayerMetadata(ncwmsLayer, catalog);
            capabilities_request = dataServices.getNCWMSLayerCapabilities(ncwmsLayer);
            capabilities_request.done(function (data) {
                ncwms_capabilities = data;
                if (selectionLayer.features.length > 0) {
                    dlLink.onBoxChange({ feature: selectionLayer.features[0] }, ncwms_capabilities);
                }
            });
        });
        ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);

        selectionLayer.events.register('featureadded', dlLink, function (selection) {
            capabilities_request.done(function (data) {
                ncwms_capabilities = data;
                dlLink.onBoxChange(selection, data);
            });
        });

        dlLink.register($('#download-timeseries'), function (node) {
            node.attr('href', dlLink.getUrl());
        });
        setBoundsInUrlTemplate();
        dlLink.trigger();

        // Metadata/Attributes Download Link
        mdLink = new MetadataDownloadLink($('#download-metadata'), ncwmsLayer, undefined);
        ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
        mdLink.register($('#download-metadata'), function (node) {
            node.attr('href', mdLink.getUrl());
        });

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
    };

    condExport(module, prism_demo_app, 'prism_demo_app');

    $(document).ready(prism_demo_app);
})(jQuery);


