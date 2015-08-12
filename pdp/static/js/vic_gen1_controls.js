/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, getRasterAccordionMenu, getTimeSelected, ncwmsCapabilities, getRasterNativeProj, getRasterBbox, rasterBBoxToIndicies, intersection*/

"use strict";

// globals
var catalog;

function getVICControls(ensemble_name) {
    var div, form, fieldset, varMapping;

    div = pdp.createDiv('', 'control');
    form = pdp.createForm(undefined, undefined, undefined);
    fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    varMapping = {
        'bf': "Base Flow",
        'R': "Runoff",
        'swe': "Snow Water Equivalent",
        'aet': "Actual Evapotranspiration",
        'sm': "Column Total Soil Moisture",
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
