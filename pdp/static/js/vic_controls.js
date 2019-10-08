/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, getRasterAccordionMenu, getTimeSelected, ncwmsCapabilities, getRasterNativeProj, getRasterBbox, rasterBBoxToIndicies, intersection*/

"use strict";

function getVICControls(ensemble_name) {
    var div, form, fieldset, varMapping;

    div = pdp.createDiv('', 'control');
    form = pdp.createForm(undefined, undefined, undefined);
    fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    varMapping = {
    	// vic gen 1 data
        'bf': "Base Flow",
        'R': "Runoff",
        'swe': "Snow Water Equivalent",
        'aet': "Actual Evapotranspiration",
        'sm': "Column Total Soil Moisture",
        'tasmax': 'Maximum Temperature',
        'tasmin': 'Minimum Temperature',
        'pr': 'Precipitation',
        'wind': 'Wind',
        // vic gen 2 data
        'BASEFLOW': "Baseflow",
        'EVAP': "Evapotranspiration",
        'GLAC_AREA': "Glacier Area",
        'GLAC_MBAL': "Glacier Mass Balance",
        'GLAC_OUTFLOW': "Glacier Outflow",
        'PET_NATVEG': "Potential Evapotranspiration",
        'PREC': "Precipitation",
        'RAINF': "Rainfall",
        'RUNOFF': "Surface Runoff",
        'SNOW_MELT': "Snow Melt",
        'SOIL_MOIST_TOT': "Total Column Soil Moisture",
        'SWE': "Snow Water Equivalent",
        'TRANSP_VEG': "Transpiration"
         };
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name, varMapping));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
}


condExport(module, {
    getVICControls: getVICControls
});
