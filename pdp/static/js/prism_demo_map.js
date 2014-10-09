// NOTE: variables 'gs_url', 'ncwms_url', 'tilecache_url' is expected to be set before this is call
// Do this in the sourcing html

var selectionLayer;
var current_dataset;
var ncwmsCapabilities;
var selectionBbox;

function init_prism_map() {
    // Map Config
    options = pdp.map.BC3005_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = pdp.map.getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = pdp.map.getBoxLayer(selLayerName);
    panelControls = pdp.map.getEditingToolbar([pdp.map.getHandNav(), pdp.map.getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls
    var map = new OpenLayers.Map('pdp-map', options);
    
    defaults = {
        dataset: "pr_monClim_PRISM_historical_run1_197101-200012",
        variable: "pr"
    }
    
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


    datalayerName = "Climate raster"
    pdp.ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
        pdp.ncwms_url,
        params,
        {
            maxExtent: pdp.map.getBC3005Bounds(),
            buffer: 1,
            ratio: 1.5,
            opacity: 0.7,
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    $('#map-title').html(params.layers + '<br />' + pdp.ncwms.params.TIME);
    pdp.raster.getNCWMSLayerCapabilities(pdp.ncwms); // async save into global var ncwmsCapabilities
    pdp.current_dataset = params.layers;

    function customize_wms_params(layer_name) {
	    var varname = layer_name.split('/')[1];
	    if (varname == 'pr') {
	        this.params.LOGSCALE = true;
	        this.params.STYLES = 'boxfill/occam_inv';
	    } else {
	        this.params.LOGSCALE = false;
	        this.params.STYLES = 'boxfill/ferret';
	    }
    };
    pdp.ncwms.events.register('change', pdp.ncwms, customize_wms_params);

    map.addLayers(
        [
            pdp.ncwms,
            selectionLayer,
            pdp.map.getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    document.getElementById("pdp-map").appendChild(pdp.map.getOpacitySlider(pdp.ncwms));
    map.zoomToExtent(new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25), true);

    map.getClimateLayer = function() {
        return map.getLayersByName(datalayerName)[0];
    }
    map.getSelectionLayer = function() {
        return map.getLayersByName(selLayerName)[0];
    }

    var cb = new pdp.controls.Colorbar("pdpColorbar", pdp.ncwms);
    cb.refresh_values();

    return map
};
