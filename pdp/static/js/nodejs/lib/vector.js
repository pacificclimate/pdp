// pdp controls library

/* jshint browser: true */
/* global $, OpenLayers, pdp */

"use strict";

var filter_undefined = function (filter) {
    return filter === "<ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\"><ogc:And/></ogc:Filter>";
};
exports.filter_undefined = filter_undefined;

var generateGetFeatureInfoParams = function (map, x, y, query_layer, count, buffer) {
    var params = {
        REQUEST: "GetFeatureInfo",
        EXCEPTIONS: "application/vnd.ogc.se_xml",
        SERVICE: "WMS",
        VERSION: "1.1.0",
        INFO_FORMAT: "text/html",
        FORMAT: "image/png"
    };
    var custom_params = {
        BBOX: map.getExtent().toBBOX(),
        X: x,
        Y: y,
        QUERY_LAYERS: query_layer.params.LAYERS,
        FEATURE_COUNT: count,
        LAYERS: "CRMP:crmp_network_geoserver",
        WIDTH: map.size.w,
        HEIGHT: map.size.h,
        SRS: query_layer.params.SRS,
        BUFFER: buffer
    };
    if(!filter_undefined(query_layer.params.filter)) {
        params.FILTER = query_layer.params.filter;
    }
    $.extend(params, custom_params);
    return params;
};
exports.generateGetFeatureInfoParams = generateGetFeatureInfoParams;

var getLoadingPopup = function (name, loc) {
    var popup = new OpenLayers.Popup.Anchored (
        name,
        loc,
        new OpenLayers.Size(100, 60),
        "Loading... <center><img style=\"padding-top:4px\" width=30 height=30 src=\"" + pdp.app_root + "/images/anim_loading.gif\"></center>",
        null, 
        true, // Means "add a close box"
        null  // Callback on close
    );
    popup.autoSize = true;
    popup.border = "1px solid #808080";
    return popup;
};
exports.getLoadingPopup = getLoadingPopup;
