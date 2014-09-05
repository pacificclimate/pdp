
$(document).ready(function() {
    map = init_hydro_stn_map();    

    var downloadForm = pdp.createForm("download-form", "download-form", "get", pdp.app_root + "/auth/agg/")
    document.getElementById("pdp-controls").appendChild(downloadForm);
    
    // The selectionList isn't used at this time, but it seems useful.
    var selectionList = {};
    var dataArray;

    var controls = downloadForm.appendChild(getHydroStnControls(map));

    // Creates search box and adds it to DOM in the "Selection" fieldset.
    var searchBox = createSearchBox(
        'searchBox', '', [],
        function(event, ui) {
            toggleIdxSelection(ui.item.value, dataArray[ui.item.value].icon, selectionList, dataArray);
            $('#searchBox').val('');
            return false;
        }
    );
    document.getElementById('selectedStations').appendChild(searchBox);

    $.ajax(pdp.app_root + "/csv/routed_flow_metadatav4.csv")
        .done(function(data) {
            dataArray = $.csv.toObjects(data);
            for(i = 0; i < dataArray.length; ++i) {
                dataArray[i].idx = i;
            }
            // Adds data to the search box.
            $('#searchBox').autocomplete("option", "source", $.map(dataArray, function(x) { return { label: x.StationName, value: x.idx }; }));

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
