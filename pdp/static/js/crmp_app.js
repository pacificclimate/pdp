$(document).ready(function() {
    map = init_crmp_map();    

    var filtChange = pdp.curry(CRMPFilterChange, map);
    
    var filters = document.getElementById("pdp-controls").appendChild(getCRMPControls(map));
    var download = document.getElementById("pdp-controls").appendChild(getCRMPDownloadOptions());
    
    map.filters = {};
    map.filters.values = getActiveFilters;
    map.composite_filter = '';
    map.getControlsByClass('OpenLayers.Control.DrawFeature')[0].events.register('featureadded', '', pdp.curry(polyChange, map));

    // Populate selection information textbox initially.
    filtChange();
});
