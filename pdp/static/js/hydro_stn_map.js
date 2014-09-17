//var map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var map;
var selectionLayer;

function init_hydro_stn_map() {
    // Map Config
    options = BC3005_map_options();

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

    // Set up default, hover, and selected styles
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

    // Set up station layer and apply styles/selection control
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

    selectionLayer.events.on({
        beforefeatureadded: function(event) {
            poly = event.feature.geometry;
            console.log(poly)
            for (var i = stationLayer.features.length - 1; i >= 0; i--) {
                if (poly.intersects(stationLayer.features[i].geometry)) {
                    console.log('intersection');
                    selectCtrl.select(stationLayer.features[i]);
                }
            };
        }
    });

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
    map.getPolySelectLayer = function() {
        return map.getLayersByName("Polygon selection")[0]
    };
    map.selectFeatureByFid = function(fid) {
        var feature = stationLayer.getFeatureByFid(fid);
        selectCtrl.select(feature);
    };

    map.getSelectedFids = function() {
        var fids = [];
        selected = stationLayer.selectedFeatures;
        for (var i = selected.length - 1; i >= 0; i--) {
            fids.push(selected[i].fid);
        };
        return fids;
    }

    return map;
};
