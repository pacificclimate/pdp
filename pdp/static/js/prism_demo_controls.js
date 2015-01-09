/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, init_prism_map, intersection, getRasterAccordionMenu, ncwmsCapabilities, getRasterNativeProj, getRasterBbox, rasterBBoxToIndicies*/

"use strict";

//globals
var catalog, current_dataset;

function getPRISMControls(ensemble_name) {
    var div, form, fieldset, varMapping;

    div = pdp.createDiv('', 'control');
    form = pdp.createForm(undefined, undefined, undefined);
    fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    varMapping = { 'tmin': "Temperature Climatology (Min.)",
                   'tmax': "Temperature Climatology (Max.)",
                   'pr': "Precipitation Climatology"
                 };
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name, varMapping));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
}

function download(extension, map, selection_layer, ncwms_layer, dl_type) {

    var raster_proj, raster_bnds, selection_bnds;

    function callPydapDownloadUrl(raster_index_bounds) {
        var id, variable, bounds, url;

        if (raster_index_bounds.toGeometry().getArea() === 0) {
            alert("Cannot resolve selection to data grid. Please zoom in and select only within the data region.");
            return;
        }
        id = ncwms_layer.params.LAYERS.split('/')[0]; // strip the variable to get the id
        variable = ncwms_layer.params.LAYERS.split('/')[1];
        bounds = '';
        if (extension !== 'aig') {
            bounds = 'climatology_bounds,';
        }
        url = catalog[id] + '.' + extension + '?' + bounds + variable +
            '[0:12][' +
            raster_index_bounds.bottom + ':' +
            raster_index_bounds.top + '][' +
            raster_index_bounds.left + ':' +
            raster_index_bounds.right + ']&';
        if (dl_type === 'link') {
            alert(url);
        } else if (dl_type === 'data' || dl_type === 'metadata') {
            if (window.shittyIE) {
                alert("Downloads may not function completely correctly on IE <= 8. Cross your fingers and/or upgrade your browser.");
            }
            window.open(url, "_blank", "width=600,height=600");
        }
    }

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
    raster_proj = getRasterNativeProj(ncwmsCapabilities, current_dataset);
    raster_bnds = getRasterBbox(ncwmsCapabilities, current_dataset);
    selection_bnds = selection_layer.features[0].geometry.bounds.clone().
        transform(selection_layer.projection, raster_proj);
    if (!raster_bnds.intersectsBounds(selection_bnds)) {
        alert('Selection area must intersect the raster area');
        return;
    }
    rasterBBoxToIndicies(map, ncwms_layer,
                         intersection(raster_bnds, selection_bnds),
                         raster_proj, extension, callPydapDownloadUrl);
}
