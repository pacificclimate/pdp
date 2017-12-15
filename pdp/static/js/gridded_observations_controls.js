/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, getRasterAccordionMenu, getTimeSelected, ncwmsCapabilities, getRasterNativeProj, getRasterBbox, rasterBBoxToIndicies, intersection*/

"use strict";

function getObsControls(ensemble_name) {
    var div, form, fieldset, varMapping;

    div = pdp.createDiv('', 'control');
    form = pdp.createForm(undefined, undefined, undefined);
    fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    varMapping = {
        'tasmax': 'Maximum Temperature',
        'tasmin': 'Minimum Temperature',
        'pr': 'Precipitation',
        'wind': 'Wind',
         };
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name, varMapping));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
}
