// NOTE: variables 'gs_url', 'ncwms_url', 'tilecache_url' is expected to be set before this is call
// Do this in the sourcing html

var selectionLayer;
var current_dataset;
var ncwmsCapabilities;
var selectionBbox;

function init_prism_map() {
    // Map Config
    options = BC3005_map_options();

    // Map Controls
    mapControls = getBasicControls();
    selLayerName = "Box Selection";
    selectionLayer = getBoxLayer(selLayerName);
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls
    map = new OpenLayers.Map('pdp-map', options);
    
    defaults = {
        dataset: "bcprism_tmin_7100",
        variable: "tmin"
    }
    
    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        time: '1985-06-30',
        styles: '',
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
            opacity: 0.7
        }
    );

    $('#map-title').text(params.layers);
    getNCWMSLayerCapabilities(ncwms); // async save into global var ncwmsCapabilities
    current_dataset = params.layers;

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    slider = getSlider(ncwms);
    map.addControl(slider);
    addLoadingIcon(ncwms);
    map.zoomToExtent(new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25), true);

    map.getClimateLayer = function() {
        return map.getLayersByName(datalayerName)[0];
    }
    map.getSelectionLayer = function() {
        return map.getLayersByName(selLayerName)[0];
    }

    return map
};
