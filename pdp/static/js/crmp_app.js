/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, map, init_crmp_map, CRMPFilterChange, getCRMPControls, getCRMPDownloadOptions, getActiveFilters, polyChange, downloadMetadata*/

(function (window, $) {
    "use strict";

    function crmp_app() {
        var map, filtChange, downloadForm;

        const deprecationNotice = $(`
            <div style="text-align: center">
                <span style="font-weight: bold; color: orangered">
                    Deprecation Notice</span>: 
                This portal has been superseded by the 
                <a href="https://pacificclimate.org/data/met-data-portal-pcds">
                    Met Data Portal - PCDS</a>,
                and will be discontinued on Nov 30, 2022.
                For more information see the
                <a href="https://pacificclimate.org/data/bc-station-data">
                    BC Station Data page</a>.
            </div>
        `)
        $('#header').append(deprecationNotice);

        window.map = map = init_crmp_map();

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
    }

    $(document).ready(crmp_app);

    condExport(module, crmp_app);
})(window, jQuery);
