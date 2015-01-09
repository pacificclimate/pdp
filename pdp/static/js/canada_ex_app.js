/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, init_raster_map, processNcwmsLayerMetadata, getRasterControls, getRasterDownloadOptions, download*/

"use strict";

// Globals
var ensemble_name, current_dataset, ncwmsCapabilities, catalog;

$(document).ready(function () {
    var map, loginButton, ncwmsLayer, selectionLayer, catalogUrl, request, type;

    map = init_raster_map();
    loginButton = pdp.init_login("login-div");
    pdp.checkLogin(loginButton);

    ncwmsLayer = map.getClimateLayer();
    selectionLayer = map.getSelectionLayer();

    catalogUrl = "../catalog/catalog.json";
    request = $.ajax(catalogUrl, {dataType: "json"});

    document.getElementById("pdp-controls").appendChild(getRasterControls(pdp.ensemble_name));
    document.getElementById("pdp-controls").appendChild(getRasterDownloadOptions(true));

    var dlLink = new RasterDownloadLink($('#download-timeseries'), ncwmsLayer, undefined, 'nc', '', ':', ':', ':');
    $('#data-format-selector').change(function(evt) {dlLink.onExtensionChange($(this).val())});
    ncwmsLayer.events.register('change', dlLink, dlLink.onLayerChange);
    selectionLayer.events.register('featureadded', dlLink, dlLink.onBoxChange);
    // TODO: register events with changes in the calendar control
    // $(".datepicker").change(function (evt) {
    // });
    dlLink.register($('#download-timeseries'), function(node) {node.attr('href', dlLink.getUrl())});
    dlLInk.trigger()

    var mdLink = new RasterDownloadLink($('#download-metadata'), ncwmsLayer, undefined, 'das', '', ':', ':', ':');
    ncwmsLayer.events.register('change', mdLink, mdLink.onLayerChange);
    selectionLayer.events.register('featureadded', mdLink, mdLink.onBoxChange);
    // TODO: register events with changes in the calendar control
    mdLink.register($('#download-metadata'), function(node) {node.attr('href', mdLink.getUrl())});
    mdLink.trigger()

    request.then(function(data) {
        catalog = dlLink.catalog = mdLink.catalog = data;
        processNcwmsLayerMetadata(ncwmsLayer);
    });

});
