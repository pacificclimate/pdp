/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, Colorbar, BC3005_map_options, getBasicControls, getBoxLayer, getEditingToolbar, getHandNav, getBoxEditor, getBC3005Bounds_vic, getBC3005OsmBaseLayer, getOpacitySlider*/



"use strict";

function init_vic_map(archive_portal) {
    var options, mapControls, selLayerName, selectionLayer, panelControls,
        defaults, map, params, datalayerName, cb, ncwms;
        
	// Initial options vary by whether we're mapping the old or
	// new dataset.
	const vic_gen1_init = {
		dataset:"5var_day_CCSM3_A1B_run1_19500101-20991231",
		variable: "sm",
		time:  "2000-01-01T00:00:00Z"
		};
	const vic_gen2_init = {
		dataset: "BASEFLOW_day_VICGL_ACCESS1-0_rcp85_rr1ii1pp1_19450101-19451231_columbia",
		variable: "BASEFLOW",
		time: "1945-01-01T00:00:00Z"
	};
	const init = archive_portal ? vic_gen1_init : vic_gen2_init;

    // Map Config
    options = BC3005_map_options_vic(archive_portal);
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
        layers: init.dataset + "/" + init.variable,
        transparent: 'true',
        // styles: '',
        numcolorbands: 254,
        version: '1.1.1',
        srs: 'EPSG:3005',
        TIME: init.time
    };

    datalayerName = "Climate raster";
    ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        params,
        {
            maxExtent: getBC3005Bounds_vic(archive_portal),
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
    map.zoomToExtent(getBC3005Bounds_vic(archive_portal));

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

    ncwms.events.triggerEvent('change', init.dataset + "/" + init.variable);

    // Expose ncwms as a global
    (function (globals) {
        globals.ncwms = ncwms;
    }(window));

    return map;
}


condExport(module, {
    init_vic_map: init_vic_map
});
