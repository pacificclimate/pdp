/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, Colorbar, BC3005_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getBC3005Bounds_vic, getBC3005OsmBaseLayer, getOpacitySlider*/



"use strict";

function init_vic_map(init_dataset, init_variable, init_time) {
    var options, mapControls, selLayerName, selectionLayer, panelControls,
        defaults, map, params, datalayerName, cb, ncwms;

    // Map Config
    options = BC3005_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer), getPointEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;
    map = new OpenLayers.Map('pdp-map', options);

    params = {
        layers: init_dataset + "/" + init_variable,
        transparent: 'true',
        // styles: '',
        numcolorbands: 254,
        version: '1.1.1',
        srs: 'EPSG:3005',
        TIME: init_time
    };

    datalayerName = "Climate raster";
    ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        params,
        {
            maxExtent: getBC3005Bounds_vic(),
            buffer: 1,
            ratio: 1.5,
            opacity: 0.7,
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToExtent(new OpenLayers.Bounds(611014.125, 251336.4375, 2070975.0625, 1737664.5625), true);

    map.getClimateLayer = function () {
        return map.getLayersByName(datalayerName)[0];
    };
    map.getSelectionLayer = function () {
        return map.getLayersByName(selLayerName)[0];
    };

    cb = new Colorbar("pdpColorbar", ncwms);
    cb.refresh_values();

    function set_map_title(layer_name) {
        $('#map-title').html(layer_name);
        return true;
    }
    ncwms.events.register('change', ncwms, set_map_title);

    ncwms.events.registerPriority('change', ncwms, function (layer_id) {
        dataServices.getMetadata(layer_id).done(function (data) {
            ncwms.redraw(); // this does a layer redraw
            cb.force_update(data.min, data.max, data.units); // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.triggerEvent('change', init_dataset + "/" + init_variable);

    // Expose ncwms as a global
    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}


condExport(module, {
    init_vic_map: init_vic_map
});
