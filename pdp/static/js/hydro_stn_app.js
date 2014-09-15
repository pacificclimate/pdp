
$(document).ready(function() {
    map = init_hydro_stn_map();    

    var controls = getHydroStnControls();
    document.getElementById("pdp-controls").appendChild(controls);
    
    // The selectionList isn't used at this time, but it seems useful.
    var selectionList = {};
    var dataArray;

    var selection_callback = function(event, ui) {
        toggleIdxSelection(ui.item.value, dataArray[ui.item.value].icon, selectionList, dataArray);
        $('#searchBox').val('');
        return false;
    };
    $(controls.sBox).autocomplete({
        select: selection_callback,
        delay: 100,
        minLength: 2
    });

    $.ajax(pdp.app_root + "/csv/routed_flow_metadatav4.csv")
        .done(function(data) {
            dataArray = $.csv.toObjects(data);
            for(i = 0; i < dataArray.length; ++i) {
                dataArray[i].idx = i;
            }

            searchData = $.map(dataArray, function(x) {
                return { label: x.StationName, value: x.idx };
            }).concat($.map(dataArray, function(x) {
                return { label: x.SiteID, value: x.idx };
            }));

            // Adds data to the search box.
            $('#searchBox').autocomplete(
                "option",
                "source",
                searchData
            );

            var stnLayer = map.getLayersByName("Stations")[0];
            var inProj = new OpenLayers.Projection("EPSG:4326");
            var outProj = map.getProjectionObject();

            var icon = new OpenLayers.Icon(pdp.app_root + "/images/mini_triangle.png");
            $(dataArray).each(function(idx, row) {
                // Create markers and wire up mousedown handler to toggle selection.
                pt = new OpenLayers.LonLat(row.Longitude, row.Latitude).transform(inProj, outProj);
                var marker = new OpenLayers.Marker(pt, icon.clone());
                dataArray[idx].icon = marker.icon;
                marker.events.register('mousedown', marker, function(evt) {
                    toggleIdxSelection(idx, this.icon, selectionList, dataArray);
                    OpenLayers.Event.stop(evt); 
                });
                stnLayer.addMarker(marker);
            });
        });
});
