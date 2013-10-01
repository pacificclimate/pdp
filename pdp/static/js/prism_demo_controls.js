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

function download(extension, map, selection) {
    // Check input.  Relies upon global var selectionLayer, ncwmsCapabilities
    if (selection.features.length == 0) {
        alert("You need to first select a rectangle of data to download (use the polygon tool in the top, right corner of the map.");
            return;
        };
        var selgeo = selection.features[0].geometry
        if (ncwmsCapabilities == undefined) {
            alert("I'm still trying to determine the geographic bounds of the selected layer.  Try again in a few seconds.");
            return;
        };
        rasterBbox = getRasterBbox(ncwmsCapabilities, current_dataset);
        if (selgeo.getArea() == 0) {
            alert("Selection area must be of non-zero area (i.e. have extent)");
            return;
        };
        if (! rasterBbox.intersectsBounds(selgeo.bounds.transform(selection.projection, getProjection(4326)))) {
            alert('Selection area must intersect the raster area');
            return;
        };
        alert('progressing to download')
        rasterBBoxToIndicies(map, current_dataset, intersection(rasterBbox, selectionBbox), extension);
    };