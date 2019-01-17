/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, map, init_crmp_map, CRMPFilterChange, getCRMPControls, getCRMPDownloadOptions, getActiveFilters, polyChange, downloadMetadata*/
"use strict";

var map;

$(document).ready(function () {
    var filtChange, downloadForm;

    map = init_crmp_map();

    filtChange = pdp.curry(CRMPFilterChange, map);

    const dataUrl = pdp.data_root + "/pcds/agg/";
    downloadForm = pdp.createForm("download-form", "download-form", "get", dataUrl);
    document.getElementById("pdp-controls").appendChild(downloadForm);

    downloadForm.appendChild(getCRMPControls(map));
    downloadForm.appendChild(getCRMPDownloadOptions());

    map.filters = {};
    map.filters.values = getActiveFilters;
    map.composite_filter = '';
    map.getControlsByClass('OpenLayers.Control.DrawFeature')[0].events.register('featureadded', '', pdp.curry(polyChange, map));

    // Wire up legend button to pop up network-name-help.
    $("#legend-button").on('click', function () { $('#network-name-help').dialog("open"); return false; });

    $('#md-download-button').click(function (e) { downloadMetadata(e, map); });

    // No map titles for CRMP...
    $("#map-title").remove();

    // Populate selection information textbox initially.
    filtChange();
});
