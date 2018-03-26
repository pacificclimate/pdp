/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, init_prism_map, intersection, getRasterAccordionMenu, ncwmsCapabilities, getRasterNativeProj, getRasterBbox, rasterBBoxToIndicies*/

"use strict";

function getPRISMControls(ensemble_name) {
    var div, form, fieldset, varMapping;

    div = pdp.createDiv('', 'control');
    form = pdp.createForm(undefined, undefined, undefined);
    fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    varMapping = { 'tmin': "Minimum Temperature",
                   'tmax': "Maximum Temperature",
                   'pr': "Precipitation"
                 };
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name, varMapping));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
}
