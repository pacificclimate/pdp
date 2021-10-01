/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, na4326_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getNaBaseLayer, getOpacitySlider, Colorbar*/

/*
 * This map displays all-Canada pr, tasmin, and tasmax datasets.
 * It is used by:
 *    * The BCSD and BCCAQv1 datasets (canada_ex_app.js)
 *    * The BCCAQv2 CMIP5 datasets (canada_ex_app.js)
 *    * The BCCAQv2 CMIP6 datasets (cmip6_bccaq2_app.js)
 * Each seperate app passes in a default dataset and timestamp
 * to initialize the map, but they have the same pallettes,
 * numerical and spatial extents.
 */
(function () {

    "use strict";

    function init_raster_map(initialMap) {
        var options, mapControls, selLayerName, selectionLayer, panelControls,
            map, na_osm, params, ncwms, datalayerName, cb;

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

        params = {
            layers: initialMap.dataset + "/" + initialMap.variable,
            transparent: "true",
            styles: "default/ferret",
            time: initialMap.timestamp,
            numcolorbands: 249,
            version: "1.1.1",
            srs: "EPSG:4326",
            colorscalerange: "-50,11",
            logscale: false
        };

        datalayerName = "Climate raster";
        ncwms = new OpenLayers.Layer.WMS(
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
                this.params.LOGSCALE = true;
                this.params.STYLES = 'default/blueheat';
                this.params.BELOWMINCOLOR = 'transparent';
                this.params.COLORSCALERANGE = '1.0,30.0';
            } else {
                this.params.LOGSCALE = false;
                this.params.STYLES = 'default/ferret';
                this.params.COLORSCALERANGE = '-50,15';
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
            dataServices.getMetadata(layer_id).done(function (data) {
                var new_params = customize_wms_params.call(ncwms, layer_id);
                ncwms.mergeNewParams(new_params); // this does a layer redraw
                cb.force_update(parseFloat(ncwms.params.COLORSCALERANGE.split(",")[0]),
                    parseFloat(ncwms.params.COLORSCALERANGE.split(",")[1]),
                    data.units); // must be called AFTER ncwms params updated
            });
        });

        ncwms.events.triggerEvent('change', initialMap.dataset + "/" + initialMap.variable);

        // TODO: This is not really a good idea. Fix it.
        (function (globals) {
            globals.ncwms = ncwms;
        }(window));

        return map;
    }


    condExport(module, {
        init_raster_map: init_raster_map
    });
})();
