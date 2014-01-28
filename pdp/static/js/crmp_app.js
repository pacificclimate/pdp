
$(document).ready(function() {
    map = init_crmp_map();    

    var loginButton = pdp.init_login("login-div");
    pdp.checkLogin(loginButton);
    
    var filtChange = pdp.curry(CRMPFilterChange, map);

    var downloadForm = pdp.createForm("download-form", "download-form", "get", pdp.app_root + "/auth/agg/")
    document.getElementById("pdp-controls").appendChild(downloadForm);
    
    var filters = downloadForm.appendChild(getCRMPControls(map));
    var download = downloadForm.appendChild(getCRMPDownloadOptions());
    
    map.filters = {};
    map.filters.values = getActiveFilters;
    map.composite_filter = '';
    map.getControlsByClass('OpenLayers.Control.DrawFeature')[0].events.register('featureadded', '', pdp.curry(polyChange, map));

    // Wire up legend button to pop up network-name-help.
    $("#legend-button").on('click', function() { $('#network-name-help').dialog("open"); return false; });


    $('#md-download-button').click( function(e) { downloadMetadata(e, map); });

    // No map titles for CRMP...
    $("#map-title").remove();

    // Populate selection information textbox initially.
    filtChange();
});

