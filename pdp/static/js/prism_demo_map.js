/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, BC3005_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getBC3005Bounds, getBC3005OsmBaseLayer, getOpacitySlider, Colorbar*/

"use strict";

function init_prism_map() {
    var selectionLayer, options, mapControls, selLayerName, panelControls,
        map, defaults, params, datalayerName, cb, ncwms;

    // Map Config
    options = BC3005_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;
    map = new OpenLayers.Map('pdp-map', options);

    defaults = {
        dataset: "pr_monClim_PRISM_historical_run1_197101-200012",
        variable: "pr"
    };

    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        time: '1985-06-30',
        styles: 'boxfill/occam_inv',
        logscale: true,
        numcolorbands: 254,
        version: '1.1.1',
        srs: 'EPSG:3005'
    };


    datalayerName = "Climate raster";
    ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        params,
        {
            maxExtent: getBC3005Bounds(),
            buffer: 1,
            ratio: 1.5,
            opacity: 0.7,
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    function set_map_title(layer_name) {
        // 'this' must be bound to the ncwms layer object
        var d = new Date(this.params.TIME), date;
        if (layer_name.match(/_yr_/)) { // is yearly
            date = d.getFullYear();
        } else {
            date = d.getFullYear() + '/' + (d.getMonth() + 1);
        }
        $('#map-title').html(layer_name + '<br />' + date);

        return true;
    }

    function ncwms_params(layer_name) {
        var varname = layer_name.split('/')[1];
        if (varname === 'pr') {
            this.params.LOGSCALE = true;
            this.params.STYLES = 'boxfill/occam_inv';
        } else {
            this.params.LOGSCALE = false;
            this.params.STYLES = 'boxfill/ferret';
        }

        if (varname === 'pr') {
            this.params.COLORSCALERANGE = '10,12500';
        } else if (varname == 'tmax') {
            this.params.COLORSCALERANGE = '-20,30';
        } else if (varname == 'tmin' ) {
            this.params.COLORSCALERANGE = '-30,20';
        }

        var uniqueID = layer_name.split('/')[0].split('_');
        var timeRange = uniqueID[uniqueID.length -1];
        if (timeRange === '197101-200012') {
            this.params.TIME = '1985-06-30';
        } else if (timeRange === '198101-201012') {
            this.params.TIME = '1996-06-30';
        }

        return this.params
    }

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToExtent(new OpenLayers.Bounds(-236114, 41654.75, 2204236, 1947346.25), true);

    map.getClimateLayer = function () {
        return map.getLayersByName(datalayerName)[0];
    };
    map.getSelectionLayer = function () {
        return map.getLayersByName(selLayerName)[0];
    };

    cb = new Colorbar("pdpColorbar", ncwms);
    cb.refresh_values();

    ncwms.events.registerPriority('change', ncwms, function (layer_id) {
        var lyr_params, metadata_req;

        lyr_params = {
            "id": layer_id.split('/')[0],
            "var": layer_id.split('/')[1]
        };
        metadata_req = $.ajax({
            url: "../metadata.json?request=GetMinMaxWithUnits",
            data: lyr_params
        });
        metadata_req.done(function (data) {
            var new_params = ncwms_params.call(ncwms, layer_id);
            ncwms.mergeNewParams(new_params); // this does a layer redraw
            cb.force_update(parseFloat(ncwms.params.COLORSCALERANGE.split(',')[0]),
                            parseFloat(ncwms.params.COLORSCALERANGE.split(',')[1]),
                            data.units); // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.register('change', ncwms, set_map_title);
    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

    // Expose ncwms as a global
    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}
