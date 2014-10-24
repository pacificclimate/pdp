// NOTE: variables 'gs_url', 'ncwms_url', 'tilecache_url' is expected to be set before this is call
// Do this in the sourcing html

var selectionLayer;
var current_dataset;
var ncwmsCapabilities;
var selectionBbox;

function init_vic_map() {
    // Map Config
    options = BC3005_map_options_vic();
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
        dataset: "5var_day_CCSM3_A1B_run1_19500101-20991231",
        variable: "sm"
    }
    
    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        transparent: 'true',
        // styles: '',
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
            maxExtent: getBC3005Bounds_vic(),
            buffer: 1,
            ratio: 1.5,
            opacity: 0.7,
            transitionEffect: null,
            tileSize: new OpenLayers.Size(512, 512)
        }
    );

    getNCWMSLayerCapabilities(ncwms); // async save into global var ncwmsCapabilities
    current_dataset = params.layers;

    map.addLayers(
        [
            ncwms,
            selectionLayer,
            getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );

    document.getElementById("pdp-map").appendChild(getOpacitySlider(ncwms));
    map.zoomToExtent(new OpenLayers.Bounds(611014.125,251336.4375,2070975.0625,1737664.5625), true);

    map.getClimateLayer = function() {
        return map.getLayersByName(datalayerName)[0];
    }
    map.getSelectionLayer = function() {
        return map.getLayersByName(selLayerName)[0];
    }

    var cb = new Colorbar("pdpColorbar", ncwms);
    cb.refresh_values();

    var set_map_title = function (layer_name) {
        $('#map-title').html(layer_name);
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
            ncwms.redraw(); // this does a layer redraw
            cb.force_update(data.min, data.max, data.units) // must be called AFTER ncwms params updated
        });
    });

    ncwms.events.triggerEvent('change', defaults.dataset + "/" + defaults.variable);

    return map
};
