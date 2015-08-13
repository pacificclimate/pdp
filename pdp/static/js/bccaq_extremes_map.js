/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, d3, pdp, na4326_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getNaBaseLayer, Colorbar, getOpacitySlider*/

"use strict";

//var pcds_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html
var pcds_map, gs_url, map;

function init_raster_map() {

    var options, mapControls, selLayerName, selectionLayer, panelControls,
        na_osm, defaults, datalayerName, cb;

    function ncwms_params(layer_name, colorscale_min, colorscale_max) {
        var params, varname, c_range, prec_range, percent_data, number_days_data,
            temp_data, prec_data, var_data;

        // common ncWMS parameters for *all* layers
        params = {
            LAYERS: layer_name,
            transparent: "true",
            numcolorbands: 254,
            version: "1.1.1",
            SRS: "EPSG:4326",
            service: "WMS",
            request: "GetMap",
            WIDTH: 512,
            HEIGHT: 512,
            format: 'image/png'
        };

        varname = layer_name.split('/')[1];

        if (layer_name.match(/_yr_/)) { // is yearly
            params.TIME = "2001-07-02T00:00:00Z";
        } else {
            params.TIME = "2001-07-16T00:00:00Z";
        }
        if (colorscale_min !== undefined && colorscale_max !== undefined) {
            c_range = colorscale_min + ", " + colorscale_max;
            prec_range = (colorscale_min <= 0 ? 1 : colorscale_min) + ", " + colorscale_max;
        }

        percent_data = { COLORSCALERANGE: c_range, STYLES: 'boxfill/ferret', LOGSCALE: false };
        number_days_data = { COLORSCALERANGE: c_range, STYLES: 'boxfill/ferret', LOGSCALE: false};
        temp_data = { COLORSCALERANGE: c_range, STYLES: 'boxfill/ferret', LOGSCALE: false };
        prec_data = { COLORSCALERANGE: prec_range, STYLES: 'boxfill/occam_inv', LOGSCALE: true };

        var_data = {
            r1mmETCCDI: number_days_data,
            r10mmETCCDI: number_days_data,
            r20mmETCCDI: number_days_data,
            tn10pETCCDI: percent_data,
            tx10pETCCDI: percent_data,
            tn90pETCCDI: percent_data,
            tx90pETCCDI: percent_data,
            dtrETCCDI: temp_data,
            tnnETCCDI: temp_data,
            tnxETCCDI: temp_data,
            txnETCCDI: temp_data,
            txxETCCDI: temp_data,
            rx5dayETCCDI: prec_data,
            rx1dayETCCDI: prec_data,
            prcptotETCCDI: prec_data,
            gslETCCDI: number_days_data,
            suETCCDI: number_days_data,
            trETCCDI: number_days_data,
            idETCCDI: number_days_data,
            fdETCCDI: number_days_data,
            sdiiETCCDI: prec_data,
            cwdETCCDI: number_days_data,
            altcwdETCCDI: number_days_data,
            cddETCCDI: number_days_data,
            altcddETCCDI: number_days_data,
            csdiETCCDI: number_days_data,
            altcsdiETCCDI: number_days_data,
            wsdiETCCDI: number_days_data,
            altwsdiETCCDI: number_days_data,
            r95pETCCDI: prec_data,
            r99pETCCDI: prec_data
        };

        $.extend(params, var_data[varname]);
        return params;
    }

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

    // Map Config
    options = na4326_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;
    map = new OpenLayers.Map("pdp-map", options);

    na_osm = getNaBaseLayer(pdp.tilecache_url, 'North America OpenStreetMap', 'world_4326_osm', mapControls.projection);

    defaults = {
        dataset: "rx1dayETCCDI_yr_BCCAQ-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_1950-2100",
        variable: "rx1dayETCCDI"
    };

    datalayerName = "Climate raster";
    var ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        ncwms_params(defaults.dataset + "/" + defaults.variable),
        {
            buffer: 1,
            ratio: 1.5,
            wrapDateLine: true,
            opacity: 0.7,
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    cb = new Colorbar("pdpColorbar", ncwms);

    ncwms.events.registerPriority('change', ncwms, function (layer_id) {
        var params, metadata_req;
        params = {
            "id": layer_id.split('/')[0],
            "var": layer_id.split('/')[1]
        };
        metadata_req = $.ajax({
            url: "../metadata.json?request=GetMinMaxWithUnits",
            data: params
        });
        metadata_req.done(function (data) {
            var new_params = ncwms_params(layer_id, data.min, data.max);
            delete ncwms.params.COLORSCALERANGE;
            ncwms.mergeNewParams(new_params); // this does a layer redraw
            cb.force_update(data.min, data.max, data.units); // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.register('change', ncwms, set_map_title);
    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

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

    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}
