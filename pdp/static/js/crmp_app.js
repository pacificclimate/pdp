/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, map, init_crmp_map, CRMPFilterChange, getCRMPControls, getCRMPDownloadOptions, getActiveFilters, polyChange, downloadMetadata*/
"use strict";

var map;

$(document).ready(function () {
    var loginButton, filtChange, downloadForm;

    map = init_crmp_map();

    loginButton = pdp.init_login("login-div");
    pdp.checkLogin(loginButton);

    filtChange = pdp.curry(CRMPFilterChange, map);

    downloadForm = pdp.createForm("download-form", "download-form", "get", "../../data/pcds/agg/");
    document.getElementById("pdp-controls").appendChild(downloadForm);

    downloadForm.appendChild(getCRMPControls(map));
    downloadForm.appendChild(getCRMPDownloadOptions());

    // $(downloadForm).submit(function (event) {
    //     //This doesn't really check if we're logged in... but it's a quick fix
    //     if (!$(loginButton).prop("loggedIn")) {
    //         alert("Please log in before downloading data");
    //         event.preventDefault();
    //     }
    // });

    map.filters = {};
    map.filters.values = getActiveFilters;
    map.composite_filter = '';
    map.getControlsByClass('OpenLayers.Control.DrawFeature')[0].events.register('featureadded', '', pdp.curry(polyChange, map));

    // Specify full timeseries download by setting min/max dates
    $("#download-full-timeseries").change(
        function(evt) {
            if (this.checked) {
                $("#from-date").datepicker('disable').addClass("disabled").datepicker("setDate", "1870/01/01");
                $("#to-date").datepicker('disable').addClass("disabled").datepicker("setDate", new Date());
            } else {
                $("#from-date").datepicker('enable').removeClass("disabled");
                $("#to-date").datepicker('enable').removeClass("disabled");
            }
        }
    );

    // Wire up legend button to pop up network-name-help.
    $("#legend-button").on('click', function () { $('#network-name-help').dialog("open"); return false; });

    $('#md-download-button').click(function (e) { downloadMetadata(e, map); });

    // No map titles for CRMP...
    $("#map-title").remove();

    // Populate selection information textbox initially.
    filtChange();
});
