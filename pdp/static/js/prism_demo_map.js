/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, BC3005_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getBC3005Bounds, getBC3005OsmBaseLayer, getOpacitySlider, Colorbar*/

"use strict";

function init_prism_map(config) {
    var selectionLayer, options, mapControls, selLayerName, panelControls,
      map, params, datalayerName, cb, ncwms;

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
        layers: config.defaults.dataset + "/" + config.defaults.variable,
        transparent: 'true',
        time: '1985-06-30',
        styles: 'default/occam-inv',
        logscale: true,
        numcolorbands: 249,
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
        var months = ["January","February","March","April",
          "May","June","July","August",
          "September","October","November","December"];
        // 'this' must be bound to the ncwms layer object
        var d = new Date(this.params.TIME), date;
        if (layer_name.match(/_yr_/)) { // is yearly
            date = d.getFullYear();
        } else {
            date = months[d.getMonth()] + ' ' + d.getFullYear();
        }
        $('#map-title').html(layer_name + '<br />' + date);

        return true;
    }

    function ncwms_params(layer_name) {
        // TODO: Place this utility function elsewhere. Note: Could use
        //  lodash.get for this, but it would be more complicated.
        function getWithDefault(obj, key, defKey="_default") {
            return obj[key in obj ? key : defKey];
        }

        // Extract dataset unique id and variable name from layer name.
        const layer_name_parts = layer_name.split('/');
        const uniqueId = layer_name_parts[0];
        const varname = layer_name_parts[1];

        // Extract metadata from the unique id. It would be far preferable
        // to derive this information from the contents of the modelmeta
        // database, but that would require more far-reaching changes.
        // See https://github.com/pacificclimate/pdp/issues/193
        const metadataRegex = /.*_(mon|yr)_.*_(\d{4})\d*-(\d{4})\d*/g;
        const match = metadataRegex.exec(uniqueId)
        if (!match) {
            return this.params;
        }
        const timescale = match[1]
        const startYear = Number(match[2]);
        const endYear = Number(match[3]);

        const isClimatology = endYear - startYear <= 30;

        const wmsParamsForVar = getWithDefault(config.wmsParams, varname);

        for (const name of ["LOGSCALE", "STYLES"]) {
            this.params[name] = wmsParamsForVar[name];
        }

        const datasetType = isClimatology ? "climatology" : "timeseries";
        const ranges =
          getWithDefault(wmsParamsForVar.COLORSCALERANGE, datasetType);
        this.params.COLORSCALERANGE = getWithDefault(ranges, timescale);

        const dateRange = `${startYear}-${endYear}`;
        const times = getWithDefault(wmsParamsForVar.times, dateRange);
        this.params.TIME = getWithDefault(times, timescale);

        return this.params;
    }

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005BCLiteBaseLayer(pdp.bc_basemap_url, 'BC OSM Lite'),
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
        dataServices.getMetadata(layer_id).done(function (data) {
            var new_params = ncwms_params.call(ncwms, layer_id);
            ncwms.mergeNewParams(new_params); // this does a layer redraw
            cb.force_update(parseFloat(ncwms.params.COLORSCALERANGE.split(',')[0]),
                            parseFloat(ncwms.params.COLORSCALERANGE.split(',')[1]),
                            data.units); // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.register('change', ncwms, set_map_title);
    ncwms.events.triggerEvent(
      'change', config.defaults.dataset + "/" + config.defaults.variable
    );

    // Expose ncwms as a global
    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}

condExport(module, {
    init_prism_map: init_prism_map
});
