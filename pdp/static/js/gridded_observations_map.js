/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, Colorbar, na4326_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getNA4326Bounds, getTileBaseLayer, getOpacitySlider*/

"use strict";

function init_obs_map() {
    var options, mapControls, selLayerName, selectionLayer, panelControls,
        defaults, map, params, datalayerName, cb, ncwms;

    // Map Config
    options = na4326_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer), getPointEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;
    map = new OpenLayers.Map('pdp-map', options);

    defaults = {
        dataset: "wind_day_TPS_NWNA_v1_historical_19450101-20121231",
        variable: "wind"
    };

    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        numcolorbands: 249,
        version: '1.1.1',
        srs: "EPSG:4326",
        TIME: "1997-03-17T00:00:00Z",
    };

    datalayerName = "Climate raster";
    ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        params,
        {
            maxExtent: getNA4326Bounds(),
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
            getTileBaseLayer(pdp.wgs84_url, 'North America OpenStreetMap', 'world_4326_osm')
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToExtent(getNA4326Bounds(), true);

    map.getClimateLayer = function () {
        return map.getLayersByName(datalayerName)[0];
    };
    map.getSelectionLayer = function () {
        return map.getLayersByName(selLayerName)[0];
    };

    cb = new Colorbar("pdpColorbar", ncwms);
    cb.refresh_values();

    function set_map_title(layer_name) {
        // 'this' must be bound to the ncwms layer object
        var d = new Date(this.params.TIME), date;
        if (layer_name.match(/_yr_/)) { // is yearly
            date = d.getFullYear();
        } else {
            date = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + (d.getDate() + 1);
        }
        $('#map-title').html(layer_name + '<br />' + date);
        return true;
    }
    ncwms.events.register('change', ncwms, set_map_title);

    ncwms.events.registerPriority('change', ncwms, function (layer_id) {
        dataServices.getMetadata(layer_id).done(function (data) {
            var newParams = {};
            var min, max;
            var layer_var = layer_id.split('/')[1];
            if(layer_var === "pr"){
              newParams["LOGSCALE"] = true;
              min = 1;
              max = data.max;
              newParams["STYLES"] = "default/blueheat";
              newParams["BELOWMINCOLOR"] = 'extend';
            }
            else {
              newParams["LOGSCALE"] = "false";
              newParams["STYLES"] = "default/x-Rainbow";
              min = data.min;
              max = data.max;
            }
            newParams["COLORSCALERANGE"] = `${min},${max}`;
            delete ncwms.params.LOGSCALE;
            delete ncwms.params.STYLES;
            ncwms.mergeNewParams(newParams); //update logscale
            ncwms.redraw(); // this does a layer redraw
            cb.force_update(min, max, data.units); // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

    // Expose ncwms as a global
    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}


condExport(module, {
    init_obs_map: init_obs_map
});
