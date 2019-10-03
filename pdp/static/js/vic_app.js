/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, init_vic_map, processNcwmsLayerMetadata, getVICControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

/* 
This front end displays data output by the VIC-GL model.
There are two such data ensembles; one made with CMIP3 modeled
input, and one made with CMIP5 modeled input downscaled by the
BCCAQ2. The CMIP5 dataset is the newest, most up-to-date one,
but the CMIP3-based data is provided for archive purposes.

Data display and UI are similar for both datasets; they 
differ only in URL, starting dataset, and data ensemble.

CMIP3 data:
	backend: vic_gen1
	url_base: hydro_model_archive
	ensemble: vic_gen1

CMIP5 data:
	backend: vic_gen2
	url_base: hydro_model_out
	ensemble: vicgl_cmip5
*/

(function ($) {
    "use strict";

    function vic_app() {
        var map, ncwmsLayer, selectionLayer, catalogUrl, catalog_request, catalog,
            dlLink, mdLink, capabilities_request, ncwms_capabilities;
         
        //the two portals have different initial maps
        if (isArchivePortal()) {
            //the old dataset
            map = init_vic_map("5var_day_CCSM3_A1B_run1_19500101-20991231", 
            				   "sm", 
                               "2000-01-01T00:00:00Z");           
        } else {
            map = init_vic_map("BASEFLOW_day_VICGL_ACCESS1-0_rcp85_rr1ii1pp1_20450101-20451231_columbia", 
                               "BASEFLOW",
                               "2045-01-01T00:00:00Z");
        }
        
        window.map = map;

        ncwmsLayer = map.getClimateLayer();
        selectionLayer = map.getSelectionLayer();

        catalog_request = dataServices.getCatalog();

        capabilities_request = dataServices.getNCWMSLayerCapabilities(ncwmsLayer);

        document.getElementById("pdp-controls")
            .appendChild(getVICControls(pdp.ensemble_name));
        document.getElementById("pdp-controls")
            .appendChild(getRasterDownloadOptions('first', 'last'));
            
        // the archive and current portals link to eachother.
        if(isArchivePortal()) {
            //archive portal. link to new portal, add archive disclaimer.
            addPortalLink("hydro_model_out", "Main Hydrologic Model Output Portal");
            document.getElementById("pdp-controls").appendChild(getArchiveDisclaimer());
        } else {
        	// new data portal; link to old one.
        	addPortalLink("hydro_model_archive", "Archive Hydrologic Model Output Portal");
            //new portal. link to old one
        }

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
    }

    condExport(module, vic_app, 'vic_app');

    $(document).ready(vic_app);
})(jQuery);
