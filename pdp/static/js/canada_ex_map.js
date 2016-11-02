/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, na4326_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getNaBaseLayer, getOpacitySlider, Colorbar*/

"use strict";

function init_raster_map() {
    var options, mapControls, selLayerName, selectionLayer, panelControls,
        map, na_osm, defaults, params, ncwms, datalayerName, cb;

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
    map = new OpenLayers.Map("pdp-map", options);

    na_osm = getNaBaseLayer(pdp.tilecache_url, 'North America OpenStreetMap', 'world_4326_osm', mapControls.projection);

    defaults = {
        dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_19500101-21001231",
        variable: "tasmax"
    };

    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: "true",
        styles: "boxfill/ferret",
        time: "2000-01-01",
        numcolorbands: 254,
        version: "1.1.1",
        srs: "EPSG:4326",
        colorscalerange: "-50,11",
        logscale: false
    };

    datalayerName = "Climate raster";
    ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        params,
        {
            buffer: 1,
            ratio: 1.5,
            wrapDateLine: true,
            opacity: 0.7,
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    function customize_wms_params(layer_name) {
        var varname = layer_name.split('/')[1];
        if (varname === 'pr') {
            this.params.LOGSCALE = false;
            this.params.STYLES = 'boxfill/occam_inv';
            this.params.BELOWMINCOLOR = 'transparent';
            this.params.COLORSCALERANGE = '0.0,30.0';
        } else {
            this.params.LOGSCALE = false;
            this.params.STYLES = 'boxfill/ferret';
            this.params.COLORSCALERANGE = '-50,11';
        }
    }
    ncwms.events.register('change', ncwms, customize_wms_params);

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            na_osm
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToMaxExtent();

    map.getClimateLayer = function () {
        return map.getLayersByName(datalayerName)[0];
    };

    map.getSelectionLayer = function () {
        return map.getLayersByName(selLayerName)[0];
    };

    cb = new Colorbar("pdpColorbar", ncwms);

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
    ncwms.events.register('change', ncwms, set_map_title);

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
            var new_params = customize_wms_params.call(ncwms, layer_id);
            ncwms.mergeNewParams(new_params); // this does a layer redraw
            cb.force_update(parseFloat(ncwms.params.COLORSCALERANGE.split(",")[0]),
                            parseFloat(ncwms.params.COLORSCALERANGE.split(",")[1]),
                            data.units); // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}
