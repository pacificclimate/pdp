/*jslint browser: true, devel: true */
/*global pdp, $, OpenLayers, setTimeAvailable, handle_ie8_xml, DOMParser
*/

"use strict";

function filter_undefined(filter) {
    return filter === '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:And/></ogc:Filter>';
}

function generateGetFeatureInfoParams(map, x, y, query_layer, count, buffer) {
    var params, custom_params, attrname;
    params = {
        REQUEST: "GetFeatureInfo",
        EXCEPTIONS: "application/vnd.ogc.se_xml",
        SERVICE: "WMS",
        VERSION: "1.1.0",
        INFO_FORMAT: 'text/html',
        FORMAT: 'image/png'
    };
    custom_params = {
        BBOX: map.getExtent().toBBOX(),
        X: x,
        Y: y,
        QUERY_LAYERS: query_layer.params.LAYERS,
        FEATURE_COUNT: count,
        LAYERS: 'CRMP:crmp_network_geoserver',
        WIDTH: map.size.w,
        HEIGHT: map.size.h,
        SRS: query_layer.params.SRS,
        BUFFER: buffer
    };
    if (!filter_undefined(query_layer.params.filter)) {
        params.FILTER = query_layer.params.filter;
    }
    for (attrname in custom_params) {
        if (custom_params.hasOwnProperty(attrname)) {
            params[attrname] = custom_params[attrname];
        }
    }
    return params;
}

function getLoadingPopup(name, loc) {
    var popup = new OpenLayers.Popup.Anchored(
        name,
        loc,
        new OpenLayers.Size(100, 60),
        'Loading... <center><img style="padding-top:4px" width=30 height=30 src="' + pdp.app_root + '/images/anim_loading.gif"></center>',
        null,
        true, // Means "add a close box"
        null  // Callback on close
    );
    popup.autoSize = true;
    popup.border = '1px solid #808080';
    return popup;
}


condExport(module,  {
    filter_undefined: filter_undefined,
    generateGetFeatureInfoParams: generateGetFeatureInfoParams,
    getLoadingPopup: getLoadingPopup
});
