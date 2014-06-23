//var pcds_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html
"use strict";

var current_dataset;

var init_raster_map = function() {
    function customize_wms_params(layer_name) {
	var varname = layer_name.split('/')[1];
	var is_yearly = layer_name.match(/_yr_/)
	if(is_yearly)
	    this.params.TIME = "1950-07-02T00:00:00Z";
	else
	    this.params.TIME = "1950-07-16T00:00:00Z";
	
	var percent_data = { COLORSCALERANGE: "0,100", STYLES: 'boxfill/ferret', LOGSCALE: false };
	var number_days_data = { COLORSCALERANGE: "0, 366", STYLES: 'boxfill/ferret', LOGSCALE: false};
	var temp_data = { STYLES: 'boxfill/ferret', LOGSCALE: false };
	var prec_data = { STYLES: 'boxfill/occam_inv', LOGSCALE: false };

	var var_data = { 
	    r1mmETCCDI: number_days_data,
	    r10mmETCCDI: $.extend({ COLORSCALERANGE: "0,150"}, number_days_data),
	    r20mmETCCDI: $.extend({ COLORSCALERANGE: "0,100"}, number_days_data),
	    tn10pETCCDI: percent_data, 'tx10pETCCDI': percent_data, 'tn90pETCCDI': percent_data, 'tx90pETCCDI': percent_data,
	    dtrETCCDI: $.extend({ COLORSCALERANGE: "0,25"}, temp_data),
	    tnnETCCDI: $.extend({ COLORSCALERANGE: "-80,25"}, temp_data),
	    tnxETCCDI: $.extend({ COLORSCALERANGE: "-50,35"}, temp_data),
	    txnETCCDI: $.extend({ COLORSCALERANGE: "-65,45"}, temp_data),
	    txxETCCDI: $.extend({ COLORSCALERANGE: "-45,55"}, temp_data),
	    rx5dayETCCDI: $.extend({ COLORSCALERANGE: "0,1500"}, prec_data),
	    rx1dayETCCDI: $.extend({ COLORSCALERANGE: "0,1000"}, prec_data),
	    prcptotETCCDI: $.extend({ COLORSCALERANGE: "0,5000"}, prec_data),
	    gslETCCDI: number_days_data,
	    suETCCDI: $.extend({ COLORSCALERANGE: "0,200"}, number_days_data), 
	    trETCCDI: $.extend({ COLORSCALERANGE: "0,150"}, number_days_data),
	    idETCCDI: number_days_data,
	    fdETCCDI: number_days_data,
	    sdiiETCCDI: $.extend({ COLORSCALERANGE: "0,50"}, prec_data),
	    cwdETCCDI: $.extend({ COLORSCALERANGE: "0,100"}, number_days_data),
	    altcwdETCCDI: $.extend({ COLORSCALERANGE: "0,100"}, number_days_data),
	    cddETCCDI: number_days_data,
	    altcddETCCDI: number_days_data,
	    csdiETCCDI: $.extend({ COLORSCALERANGE: "0,150"}, number_days_data),
	    altcsdiETCCDI: $.extend({ COLORSCALERANGE: "0,150"}, number_days_data),
	    wsdiETCCDI: number_days_data,
	    altwsdiETCCDI: number_days_data,
	    r95pETCCDI: $.extend({ COLORSCALERANGE: "0,4000"}, prec_data),
	    r99pETCCDI: $.extend({ COLORSCALERANGE: "0,4000"}, prec_data)
	};

	$.extend(this.params, var_data[varname])
	$('#map-title').html(layer_name + '<br />' + this.params.TIME);

	return true;
    };

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
        dataset: "rx1dayETCCDI_yr_BCCAQ-ANUSPLIN300-CanESM2_historical-rcp26_r1i1p1_1950-2100",
        variable: "rx1dayETCCDI"
    };
    
    var params = {
        LAYERS: defaults.dataset + "/" + defaults.variable,
        transparent: "true",
        numcolorbands: 254,
        version: "1.1.1",
        srs: "EPSG:4326",
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

    ncwms.events.register('change', ncwms, customize_wms_params);
    ncwms.events.triggerEvent('change', defaults.dataset);

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

    return map;
};
