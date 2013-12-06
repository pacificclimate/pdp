function getPRISMControls(ensemble_name) {
    var div = pdp.createDiv('', 'control');
	var form = pdp.createForm(undefined, undefined, undefined);
    var fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
}

function getPRISMDownloadOptions() {
    var frag = document.createDocumentFragment();
    var div = frag.appendChild(pdp.createDiv('', 'control'));
    var downloadForm = div.appendChild(pdp.createForm("download-form", "download-form", "get"));
    var downloadFieldset = downloadForm.appendChild(pdp.createFieldset("downloadset", "Download Data"));
    downloadFieldset.appendChild(createRasterFormatOptions());
    downloadFieldset.appendChild(createDownloadButtons('download-buttons', 'download-buttons', {'download-timeseries': 'Timeseries' }));
    return frag;
}

function download(extension, map, selection_layer, ncwms_layer) {

    var callPydapDownloadUrl = function (raster_index_bounds) {
        if (raster_index_bounds.toGeometry().getArea() == 0) {
            alert("Cannot resolve selection to data grid. Please zoom in and select only within the data region.");
            return;
        }
        var id = ncwms_layer.params.LAYERS.split('/')[0]; // strip the variable to get the id
        var variable = ncwms_layer.params.LAYERS.split('/')[1];
        var url = catalog[id] + '.' + extension + '?climatology_bounds,' + variable +
            '[0:12][' + 
            raster_index_bounds.bottom + ':' + 
            raster_index_bounds.top + '][' + 
            raster_index_bounds.left + ':' + 
            raster_index_bounds.right + ']&';
        window.open(url,"","width=600,height=600");
    }

    // Check input.  Relies upon global var ncwmsCapabilities
    if (selection_layer.features.length == 0) {
        alert("You need to first select a rectangle of data to download (use the polygon tool in the top, right corner of the map.");
        return;
    };
    if (ncwmsCapabilities == undefined) {
        alert("I'm still trying to determine the geographic bounds of the selected layer.  Try again in a few seconds.");
        return;
    };
    if (catalog == undefined) {
        alert("I'm still trying determine what information is available for this layer.  Try again in a few seconds");
        return;
    };
    if (selection_layer.features[0].geometry.getArea() == 0) {
        alert("Selection area must be of non-zero area (i.e. have extent)");
        return;
    };
    var raster_proj = getRasterNativeProj(ncwmsCapabilities, current_dataset);
    var raster_bnds = getRasterBbox(ncwmsCapabilities, current_dataset);
    var selection_bnds = selection_layer.features[0].geometry.bounds.clone().
        transform(selection_layer.projection, raster_proj);
    if (! raster_bnds.intersectsBounds(selection_bnds)) {
        alert('Selection area must intersect the raster area');
        return;
    }
    rasterBBoxToIndicies(map, ncwms_layer, 
        intersection(raster_bnds, selection_bnds), 
        raster_proj, extension, callPydapDownloadUrl);
}