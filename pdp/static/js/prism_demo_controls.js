function getPRISMControls() {
	var form = createForm(undefined, undefined, undefined);
    var fieldset = createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu('bc_prism_demo'));
    form.appendChild(fieldset);
    return form;
}

function getPRISMDownloadOptions() {
    var frag = document.createDocumentFragment();
    var downloadForm = frag.appendChild(createForm("download-form", "download-form", "get"));
    var downloadFieldset = downloadForm.appendChild(createFieldset("downloadset", "Download Data"));
    downloadFieldset.appendChild(createRasterFormatOptions());
    downloadFieldset.appendChild(createDownloadButtons('download-buttons', 'download-buttons', {'download-timeseries': 'Timeseries' }));
    return frag;
}

function download(extension, map, selection_layer, ncwms_layer) {
    // Check input.  Relies upon global var selectionLayer, ncwmsCapabilities
    if (selection_layer.features.length == 0) {
        alert("You need to first select a rectangle of data to download (use the polygon tool in the top, right corner of the map.");
            return;
        };
        var selection_geo = selection_layer.features[0].geometry
        if (ncwmsCapabilities == undefined) {
            alert("I'm still trying to determine the geographic bounds of the selected layer.  Try again in a few seconds.");
            return;
        };
        if (selection_geo.getArea() == 0) {
            alert("Selection area must be of non-zero area (i.e. have extent)");
            return;
        };
        var raster_proj = getRasterNativeProj(ncwmsCapabilities, current_dataset);
        var raster_bnds = getRasterBbox(ncwmsCapabilities, current_dataset);
        var selection_bnds = selection_geo.bounds.transform(selection_layer.projection, raster_proj);
        if (! raster_bnds.intersectsBounds(selection_bnds)) {
            alert('Selection area must intersect the raster area');
            return;
        };
        rasterBBoxToIndicies(map, ncwms_layer, intersection(raster_bnds, selection_bnds), raster_proj, extension);
    };