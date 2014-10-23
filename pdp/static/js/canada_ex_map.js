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

    var na_osm = getNaBaseLayer(pdp.tilecache_url, 'North America OpenStreetMap', 'world_4326_osm', mapControls.projection)

    var defaults = {
        dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_19500101-21001231",
        variable: "tasmax"
    };
    
    var params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: "true",
        styles: "boxfill/ferret",
        // colorscalerange: 'auto', //FIXME: after layer update, set colorscalerange based on map extent
        time: "2000-01-01",
        numcolorbands: 254,
        version: "1.1.1",
        srs: "EPSG:4326",
        colorscalerange: "-50,11.0",
        logscale: false
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
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    current_dataset = params.layers;

    function customize_wms_params(layer_name) {
        var varname = layer_name.split('/')[1];
        if (varname == 'pr') {
            this.params.LOGSCALE = false;
            this.params.STYLES = 'boxfill/occam_inv';
            this.params.BELOWMINCOLOR = 'transparent';
            this.params.COLORSCALERANGE = '0.0,30.0';
        } else {
            this.params.LOGSCALE = false;
            this.params.STYLES = 'boxfill/ferret';
            this.params.COLORSCALERANGE = '-50,11';
        }
    };
    ncwms.events.register('change', ncwms, customize_wms_params);

    (function(globals){
        "use strict"
        globals.ncwms = ncwms;
    }(window));

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            na_osm
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

    var cb = new Colorbar("pdpColorbar", ncwms);
    cb.refresh_values();

    var set_map_title = function (layer_name) {
        // 'this' must be bound to the ncwms layer object
        var d = new Date(this.params.TIME);
        if( layer_name.match(/_yr_/) ) { // is yearly
            var date = d.getFullYear();
        } else {
            var date = d.getFullYear() + '/' + (d.getMonth() + 1);
        }
        $('#map-title').html(layer_name + '<br />' + date);

        return true;
    };
    ncwms.events.register('change', ncwms, set_map_title)

    ncwms.events.registerPriority('change', ncwms, function (layer_id) {
        var params = {
            id: layer_id.split('/')[0],
            var: layer_id.split('/')[1]
        }
        var metadata_req = $.ajax(
        {
            url: "../metadata.json?request=GetMinMaxWithUnits",
            data: params
        });
        metadata_req.done(function(data) {
            var new_params = customize_wms_params.call(ncwms, layer_id);
            ncwms.mergeNewParams(new_params); // this does a layer redraw
            cb.force_update(data.min, data.max, data.units) // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

    return map;
};
