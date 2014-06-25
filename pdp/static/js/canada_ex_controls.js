var download = function(extension, map, selection_layer, ncwms_layer, dl_type) {

    var times = getTimeSelected(ncwms_layer);
    var start = times[0];
    var end = times[1];

    var callPydapDownloadUrl = function (raster_index_bounds) {
        if (raster_index_bounds.toGeometry().getArea() === 0) {
            alert("Cannot resolve selection to data grid. Please zoom in select closer to the data region.");
            return;
        }
        var id = ncwms_layer.params.LAYERS.split("/")[0]; // strip the variable to get the id
        var variable = ncwms_layer.params.LAYERS.split("/")[1];
        var url = catalog[id] + "." + extension +
            "?" + variable + "[" +
            start + ":" + end + "][" +
            raster_index_bounds.bottom + ":" +
            raster_index_bounds.top + "][" +
            raster_index_bounds.left + ":" +
            raster_index_bounds.right + "]&";
	if (dl_type === 'link') {
	    alert(url);
	} else if (dl_type === 'data' || dl_type === 'metadata') {
	    if (window.shittyIE) {
		alert("Downloads may not function completely correctly on IE <= 8. Cross your fingers and/or upgrade your browser.");
	    }
            window.open(url, "_blank", "width=600,height=600");
	}
    };

    // Check input.  Relies upon global var ncwmsCapabilities
    if (selection_layer.features.length === 0) {
        alert("You need to first select a rectangle of data to download (use the polygon tool in the top, right corner of the map.");
        return;
    }
    if (ncwmsCapabilities === undefined) {
        alert("I'm still trying to determine the geographic bounds of the selected layer.  Try again in a few seconds.");
        return;
    }
    if (catalog === undefined) {
        alert("I'm still trying determine what information is available for this layer.  Try again in a few seconds");
        return;
    }
    if (selection_layer.features[0].geometry.getArea() === 0) {
        alert("Selection area must be of non-zero area (i.e. have extent)");
        return;
    }
    if (start > end) {
        alert("End date is more recent than start date, please select an appropriate minimum and maximum date");
        return;
    }
    var raster_proj = getRasterNativeProj(window.ncwmsCapabilities, current_dataset);
    var raster_bnds = getRasterBbox(window.ncwmsCapabilities, current_dataset);
    var selection_bnds = selection_layer.features[0].geometry.bounds.clone().
        transform(selection_layer.projection, raster_proj);
    if (! raster_bnds.intersectsBounds(selection_bnds)) {
        alert("Selection area must intersect the raster area");
        return;
    }
    rasterBBoxToIndicies(map, ncwms_layer,
        intersection(raster_bnds, selection_bnds),
        raster_proj, extension, callPydapDownloadUrl);
};
