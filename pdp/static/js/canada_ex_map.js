//var pcds_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var current_dataset;
var ncwmsCapabilities;

function init_raster_map() {

    // Map Config
    options = na4326_map_options();

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls
    map = new OpenLayers.Map('pdp-map', options);

    var tiles4 = new OpenLayers.Layer.XYZ(
        "N.A. OpenStreetMap",
        "http://medusa.pcic.uvic.ca/tilecache/tilecache.py/1.0.0/na/${z}/${x}/${y}.png",
        {
            projection: mapControls.projection,
            zoomOffset: 4,
            attribution: '© OpenStreetMap contributors'
        }
    );

   
    defaults = {
        dataset: "pr-tasmax-tasmin_day_BCCA-ANUSPLIN300-CCSM4_historical-rcp45_r2i1p1_19500101-21001231",
        variable: "tasmin"
    }
    
    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        styles: '',
        // colorscalerange: 'auto', //FIXME: after layer update, set colorscalerange based on map extent
        numcolorbands: 254,
        version: '1.1.1',
        srs: 'EPSG:4326'
    };

    datalayerName = "Climate raster"
    ncwms =  new OpenLayers.Layer.WMS(
        datalayerName,
		ncwms_url,
		params,
		{
            buffer: 1,
            ratio: 1.5,
            wrapDateLine: true, 
            opacity: 0.7,
		    model: 'BCCA+ANUSPLIN300+MPI-ESM-LR',
		    variable: 'pr',
		    scenario: 'historical+rcp85',
		    run:'r3i1p1'
        }
	);

    $('#map-title').text(params.layers);
    getNCWMSLayerCapabilities(ncwms_url, defaults.dataset); // async save into global var ncwmsCapabilities
    current_dataset = params.layers;

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            tiles4
        ]
    );

    slider = getSlider(ncwms);
    map.addControl(slider);
    addLoadingIcon(ncwms);
    map.zoomToMaxExtent();

    map.getClimateLayer = function() {
        return map.getLayersByName(datalayerName)[0];
    }
    map.getSelectionLayer = function() {
        return map.getLayersByName(selLayerName)[0];
    }

    return map
};
