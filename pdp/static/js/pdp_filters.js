/*jslint browser: true, devel: true */
/*global $, jQuery, app_root, OpenLayers, map*/
"use strict";

// NOTE: variables 'app_root' is expected to be set before this is call
// Do this in the sourcing html

function getActiveFilters() {
    var i, vs = [];
    for (i in this) {
        if (this.hasOwnProperty(i) && i !== 'values') {
            vs.push(this[i]);
        }
    }
    return vs;
}

function pp_bignum(n) {
    if (n > 1e9) { return Math.floor(n / 1e9).toString() + 'G'; }
    if (n > 1e6) { return Math.floor(n / 1e6).toString() + 'M'; }
    if (n > 1e3) { return Math.floor(n / 1e3).toString() + 'k'; }
    return n;
}

// Returns a WKT formatted multipolygon of the user's polygon selection (or empty string if there are polygons)
function polygon_as_text() {
    var P4326, P3005, fts, mp;
    P4326 = new OpenLayers.Projection("EPSG:4326");
    P3005 = new OpenLayers.Projection("EPSG:3005");
    fts = map.getLayersByName("Polygon selection")[0].features;
    if (fts.length === 0) { return ''; }
    mp = new OpenLayers.Geometry.MultiPolygon($.map(fts, function (f) { return f.geometry.clone(); }));
    mp.transform(P3005, P4326); // This does a transform _in_place_ (always clone first)
    return mp.toString();
}
