//var map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var map;
var selectionLayer;

function init_hydro_stn_map() {
    // Map Config
    options = BC3005_map_options();
    //options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selectionLayer = getPolygonLayer();
    panelControls = getEditingToolbar([getHandNav(), getPolyEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;

    map = new OpenLayers.Map('pdp-map', options);

    var markerLayer = new OpenLayers.Layer.Markers("Stations");

    map.addLayers(
        [
        markerLayer,
        getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );
    map.zoomToMaxExtent();
    map.zoomToExtent(getBC3005Bounds(), true);
    return map;
};
