//var pcds_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html
"use strict";

var current_dataset;

var init_raster_map = function() {

    // Map Config
    var options = na4326_map_options();
    options.tileManager = null;

    // Map Controls
    var mapControls = getBasicControls();
    var selLayerName = "Box Selection";
    var selectionLayer = getBoxLayer(selLayerName);
    var panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;
    var map = new OpenLayers.Map("pdp-map", options);

    var tiles4 = getTileBaseLayer(pdp.tilecache_url, 'North America OpenStreetMap', 'na4326_osm', mapControls.projection)

    var defaults = {
        dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_19500101-21001231",
        variable: "tasmax"
    };
    
    var params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: "true",
        styles: "",
        // colorscalerange: 'auto', //FIXME: after layer update, set colorscalerange based on map extent
        numcolorbands: 254,
        version: "1.1.1",
        srs: "EPSG:4326"
    };

    var datalayerName = "Climate raster";
    var ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
		pdp.ncwms_url,
		params,
		{
            buffer: 1,
            ratio: 1.5,
            wrapDateLine: true,
            opacity: 0.7,
            transitionEffect: null
        }
	);

    $("#map-title").text(params.layers);
    current_dataset = params.layers;
    (function(globals){
        "use strict"
        globals.ncwms = ncwms;
    }(window));

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            tiles4
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToMaxExtent();

    map.getClimateLayer = function() {
        return map.getLayersByName(datalayerName)[0];
    };

    map.getSelectionLayer = function() {
        return map.getLayersByName(selLayerName)[0];
    };

    return map;
};
