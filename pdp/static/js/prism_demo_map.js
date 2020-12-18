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
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer), getPointEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;
    map = new OpenLayers.Map('pdp-map', options);

    defaults = {
        dataset: "pr_mon_PRISM_historical_19700101-20001231_bc",
        variable: "pr"
    };

    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        time: '1985-06-30',
        styles: 'default/occam_inv',
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
        // Extract dataset unique id and variable name from layer name.
        const layer_name_parts = layer_name.split('/');
        const uniqueId = layer_name_parts[0];
        const varname = layer_name_parts[1];

        // Extract metadata from the unique id. This is ugly and fragile,
        // but since PDP doesn't really have a data model, this is how this
        // information is available to us here.
        const metadataRegex = /.*_(mon|yr)_.*_(\d{4})\d*-(\d{4})\d*/g;
        const match = metadataRegex.exec(uniqueId)
        if (!match) {
            return this.params;
        }
        const timescale = match[1]
        const startYear = Number(match[2]);
        const endYear = Number(match[3]);

        var isClimatology = endYear - startYear > 50;

        // Set palette and logscale depending on variable
        if (varname === 'pr') {
            this.params.LOGSCALE = true;
            this.params.STYLES = 'default/occam-inv';
        } else {
            this.params.LOGSCALE = false;
            this.params.STYLES = 'default/ferret';
        }

        // Set data range depending on dataset
        if (varname === 'pr' && isClimatology) {
            this.params.COLORSCALERANGE = '200,12500';
        } else if (varname === 'pr') {
            this.params.COLORSCALERANGE = '1,2000';
        } else if (varname === 'tmax') {
            this.params.COLORSCALERANGE = '-10,20';
        } else if (varname === 'tmin' ) {
            this.params.COLORSCALERANGE = '-15,10';
        }

        // Select an example time point to display depending on the dataset.
        // Note: Again fragile, because we have no easily accessed source of
        // information about the dataset here that would let us determine
        // this value robustly.
        const cases = [
            {
                // Climo datasets 1970-2000
                startYear: 1970,
                endYear: 2000,
                timescales: {
                    mon: "1985-06-30",
                    yr: "1985-06-30",
                }
            },
            {
                // Climo datasets 1981-2010
                startYear: 1981,
                endYear: 2010,
                timescales: {
                    mon: "1996-06-15",
                    yr: "1996-06-30",
                }
            },
            {
                // Timeseries datasets 1950-2007
                startYear: 1950,
                endYear: 2007,
                timescales: {
                    mon: "1980-04-30"
                }
            },
        ];
        for (const c of cases) {
            if (
              c.startYear === startYear &&
              c.endYear === endYear &&
              c.timescales[timescale]
            ) {
                this.params.TIME = c.timescales[timescale];
            }
        }

        return this.params
    }

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreetMap', 'bc_osm')
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
    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

    // Expose ncwms as a global
    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}

condExport(module, {
    init_prism_map: init_prism_map
});
