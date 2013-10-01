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
    selectionLayer = getBoxLayer();
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls
    map = new OpenLayers.Map('pdp-map', options);
    
    defaults = {
        dataset: "bcprism_tmin_review_01",
        variable: "tmin"
    }
    
    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        styles: "boxfill/rainbow",
        numcolorbands: 254,
        logscale: false,
        version: '1.1.1',
        srs: 'EPSG:3005'
    };

    ncwms =  new OpenLayers.Layer.WMS(
        "Climate raster",
        ncwms_url,
        params,
        {
            maxExtent: getBC3005Bounds(),
            buffer: 1,
            ratio: 1.5,
            opacity: 0.7
        }
    );

    $('#map-title').text(params.layers);
    getNCWMSLayerCapabilities(ncwms_url, defaults.dataset); // async save into global var ncwmsCapabilities
    current_dataset = params.layers;

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    slider = getSlider(ncwms);
    map.addControl(slider);
    addLoadingIcon(ncwms);
    map.zoomToExtent(new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25), true);

    return map
};
