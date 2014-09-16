//var map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var map;
var selectionLayer;

function init_hydro_stn_map() {
    // Map Config
    options = BC3005_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selectionLayer = new OpenLayers.Layer.Vector(
        "Polygon selection",
        {
            'geometryType': OpenLayers.Geometry.Polygon
        }
    );

    panelControls = getEditingToolbar([getHandNav(), getPolyEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;

    map = new OpenLayers.Map('pdp-map', options);

    var defaultStyle = new OpenLayers.Style({
        externalGraphic: pdp.app_root + "/images/hydro_marker.svg",
        graphicWidth: 18,
        graphicHeight: 24,
        graphicXOffset: -9,
        graphicYOffset: -22.8
    });
    var selectStyle = new OpenLayers.Style({
        externalGraphic: pdp.app_root + "/images/hydro_marker-s.svg",
        graphicWidth: 18,
        graphicHeight: 24,
        graphicXOffset: -9,
        graphicYOffset: -22.8
    });
    var hoverStyle = new OpenLayers.Style({
        externalGraphic: pdp.app_root + "/images/hydro_marker-h.svg",
        graphicWidth: 18,
        graphicHeight: 24,
        graphicXOffset: -9,
        graphicYOffset: -22.8
    });
    var styleMap = new OpenLayers.StyleMap({
        'default':defaultStyle,
        'select': selectStyle,
        'temporary': hoverStyle
    });

    var stationLayer = new OpenLayers.Layer.Vector(
        "Stations",
        {
            styleMap: styleMap
        }
    );

    var highlightCtrl = new OpenLayers.Control.SelectFeature(stationLayer, 
        {
            hover: true,
            highlightOnly: true,
            renderIntent: "temporary",
    });
    map.addControl(highlightCtrl);
    highlightCtrl.activate();

    var selectCtrl = new OpenLayers.Control.SelectFeature(stationLayer,
        {
            multiple: true,
            toggle: true,
        }
    );
    map.addControl(selectCtrl);
    selectCtrl.activate();

    map.addLayers(
        [
        stationLayer,
        getBC3005OsmBaseLayer(pdp.tilecache_url, 'BC OpenStreeMap', 'bc_osm')
        ]
    );
    map.zoomToMaxExtent();
    map.zoomToExtent(getBC3005Bounds(), true);

    map.getStnLayer = function() {
        return map.getLayersByName("Stations")[0];
    };
    map.selectFeatureByFid = function(fid) {
        var feature = stationLayer.getFeatureByFid(fid);
        selectCtrl.select(feature);
    };

    return map;
};
