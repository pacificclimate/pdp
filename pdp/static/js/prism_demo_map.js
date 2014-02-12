// NOTE: variables 'gs_url', 'ncwms_url', 'tilecache_url' is expected to be set before this is call
// Do this in the sourcing html

var selectionLayer;
var current_dataset;
var ncwmsCapabilities;
var selectionBbox;

function init_prism_map() {
    // Map Config
    options = BC3005_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls
    map = new OpenLayers.Map('pdp-map', options);
    
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

    $('#map-title').html(params.layers + '<br />' + ncwms.params.TIME);
    getNCWMSLayerCapabilities(ncwms); // async save into global var ncwmsCapabilities
    current_dataset = params.layers;

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
    ncwms.events.register('change', ncwms, customize_wms_params);

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToExtent(new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25), true);

    map.getClimateLayer = function() {
        return map.getLayersByName(datalayerName)[0];
    }
    map.getSelectionLayer = function() {
        return map.getLayersByName(selLayerName)[0];
    }

    return map
};
