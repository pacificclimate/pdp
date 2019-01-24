/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map, processNcwmsLayerMetadata, getRasterControls, getRasterDownloadOptions, RasterDownloadLink, MetadataDownloadLink*/

/*
 * This front end displays both the BCSD/BCCAQ version 1 data and the
 * BCCAQ version 2 data.
 *
 * BCCAQ version 1:
 *    backend: bcsd_downscale_archive.py
 *    url_base: downscaled_gcms_archive
 *    ensemble: downscaled_gcms_archive
 *
 * BCCAQ version 2:
 *    backend: bccaq2_downscale.py
 *    url_base: downscaled_gcms
 *    ensemble: bccaq_version_2
 *
 * Each version contains a link to the other at the top; the archived 
 * version also has a disclaimer about the data being for comparison only.
 */

"use strict";

$(document).ready(function () {
    var map, ncwmsLayer, selectionLayer, catalogUrl, catalog_request, catalog,
        dlLink, mdLink, capabilities_request, ncwms_capabilities;

    const archivePortal = $(location).attr('href').indexOf("archive") != -1;
    map = init_raster_map(archivePortal);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    catalogUrl = "../catalog/catalog.json";
    catalog_request = $.ajax(catalogUrl, {dataType: "json"});

    capabilities_request = getNCWMSLayerCapabilities(ncwmsLayer);

    document.getElementById("pdp-controls").appendChild(getRasterControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    //UI elements vary slightly based on whether this is the archive or new portal.
    if(archivePortal) {
      //archive portal. link to new portal, add archive disclaimer.
      const portalLink = pdp.createLink("portal-link",
          undefined,
          pdp.app_root + "/downscaled_gcms/map/",
          "Main Downscaled GCMS Portal");
      document.getElementById("topnav").appendChild(portalLink);
      document.getElementById("pdp-controls").appendChild(getArchiveDisclaimer());
    } else {
      //new portal. link to old one
      const portalLink = pdp.createLink("portal-link",
          undefined,
          pdp.app_root + "/downscaled_gcms_archive/map/",
          "Archive Downscaled GCMS Portal");
      document.getElementById("topnav").appendChild(portalLink);
    }

    // Data Download Link
    dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', 'tasmax', '0:55152', '0:510', '0:1068');
    $('#data-format-selector').change(
        function (evt) {
            dlLink.onExtensionChange($(this).val());
        }
    );

    ncwmsLayer.events.register('change', dlLink, function () {
        processNcwmsLayerMetadata(ncwmsLayer, catalog);
        capabilities_request = getNCWMSLayerCapabilities(ncwmsLayer);
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
