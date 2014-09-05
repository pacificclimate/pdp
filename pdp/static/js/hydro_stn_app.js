
$(document).ready(function() {
    map = init_hydro_stn_map();    

    var downloadForm = pdp.createForm("download-form", "download-form", "get", pdp.app_root + "/auth/agg/")
    document.getElementById("pdp-controls").appendChild(downloadForm);
    
    // The selectionList isn't used at this time, but it seems useful.
    var selectionList = {};
    var dataArray;

    // Add an item from the Selection sidebar
    var addToSidebar = function(idx) {
	var item = pdp.createDiv('stnNo' + idx, '');
	item.textContent = dataArray[idx].StationName;
	
	$('#selectedStations').append(item);
    };
    
    // Remove an item from the Selection sidebar
    var removeFromSidebar = function(idx) {
	$('#stnNo' + idx).remove();
    }
    
    // Create a search box using jquery ui's autocomplete control.
    var createSearchBox = function(id, cssClass, data, select_callback) {
	var frag = document.createDocumentFragment();
	var elem = frag.appendChild(pdp.createInputElement("text", cssClass, id, id, ''));

	$(elem).autocomplete({ source: data, select: select_callback, delay: 100, minLength: 2 });

	return frag;
    }

    // Toggle whether an index into the data array is selected.
    var toggleIdxSelection = function(idx, icon) {
	var stnLayer = map.getLayersByName("Stations")[0];
	
	if(idx in selectionList) { 
	    icon.setUrl(pdp.app_root + "/images/mini_triangle.png");
	    delete selectionList[idx]; 
	    removeFromSidebar(idx); 
	} else { 
	    icon.setUrl(pdp.app_root + "/images/mini_triangle_selected.png");
	    selectionList[idx] = dataArray[idx]; 
	    addToSidebar(idx); 
	} 
	stnLayer.redraw()
    }

    var controls = downloadForm.appendChild(getHydroStnControls(map));

    // Creates search box and adds it to DOM in the "Selection" fieldset.
    var searchBox = createSearchBox('searchBox', '', [],
				    function(event, ui) { 
					toggleIdxSelection(ui.item.value, dataArray[ui.item.value].icon); 
					$('#searchBox').val(''); 
					return false; 
				    });
    document.getElementById('selectedStations').appendChild(searchBox);

    $.ajax(pdp.app_root + "/csv/routed_flow_metadatav4.csv").done(function(data) {
	dataArray = $.csv.toObjects(data);

	for(i = 0; i < dataArray.length; ++i)
	    dataArray[i].idx = i;

	// Adds data to the search box.
	$('#searchBox').autocomplete("option", "source", $.map(dataArray, function(x) { return { label: x.StationName, value: x.idx }; }));

	var stnLayer = map.getLayersByName("Stations")[0];
	
	var inProj = new OpenLayers.Projection("EPSG:4326");
	var outProj = map.getProjectionObject();

	var icon = new OpenLayers.Icon(pdp.app_root + "/images/mini_triangle.png");
	$(dataArray).each(function(idx, row) {
	    // Create markers and wire up mousedown handler to toggle selection.
	    var marker = new OpenLayers.Marker((new OpenLayers.LonLat(row.Longitude, row.Latitude)).transform(inProj, outProj), icon.clone());
	    dataArray[idx].icon = marker.icon;
	    marker.events.register('mousedown', marker, function(evt) { 
		toggleIdxSelection(idx, this.icon);
		OpenLayers.Event.stop(evt); 
	    });
	    stnLayer.addMarker(marker);
	});
    });
});

