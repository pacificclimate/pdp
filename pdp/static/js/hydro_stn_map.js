/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, BC3005_map_options, getBasicControls, getEditingToolbar, getHandNav, getPolyEditor, getBC3005OsmBaseLayer, getBC3005Bounds*/

"use strict";

//var map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html
var map, selectionLayer, gs_url;

function init_hydro_stn_map() {
    var options, mapControls, panelControls, stationLayer,
        defaultStyle, selectStyle, hoverStyle, styleMap, selectionLayer,
        highlightCtrl, selectCtrl;

    // Map Config
    options = BC3005_map_options_stn();
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

    // Set up default, hover, and selected styles
    defaultStyle = new OpenLayers.Style({
        externalGraphic: pdp.app_root + "/images/hydro_marker.svg",
        graphicWidth: 18,
        graphicHeight: 24,
        graphicXOffset: -9,
        graphicYOffset: -22.8
    });
    selectStyle = new OpenLayers.Style({
        externalGraphic: pdp.app_root + "/images/hydro_marker-s.svg",
        graphicWidth: 18,
        graphicHeight: 24,
        graphicXOffset: -9,
        graphicYOffset: -22.8
    });
    hoverStyle = new OpenLayers.Style({
        externalGraphic: pdp.app_root + "/images/hydro_marker-h.svg",
        graphicWidth: 18,
        graphicHeight: 24,
        graphicXOffset: -9,
        graphicYOffset: -22.8
    });
    styleMap = new OpenLayers.StyleMap({
        'default': defaultStyle,
        'select': selectStyle,
        'temporary': hoverStyle
    });

    // Set up station layer and apply styles/selection control
    stationLayer = new OpenLayers.Layer.Vector(
        "Stations",
        {
            styleMap: styleMap
        }
    );

    highlightCtrl = new OpenLayers.Control.SelectFeature(stationLayer, {
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
    });
    map.addControl(highlightCtrl);
    highlightCtrl.activate();

    selectCtrl = new OpenLayers.Control.SelectFeature(stationLayer, {
        multiple: true,
        toggle: true,
        clickoutFeature: true,
    });
    map.addControl(selectCtrl);
    selectCtrl.activate();

    selectionLayer.events.on({
        beforefeatureadded: function (event) {
            var i, poly = event.feature.geometry;
            for (i = stationLayer.features.length - 1; i >= 0; i -= 1) {
                if (poly.intersects(stationLayer.features[i].geometry)) {
                    map.toggleSelectFeatureByFid(stationLayer.features[i].fid);
                }
            }
        }
    });

    map.addLayers(
        [
            stationLayer,
            getBC3005BCLiteBaseLayer(pdp.bc_basemap_url, 'BC OSM Lite'),
        ]
    );
    map.zoomToMaxExtent();

    map.getStnLayer = function () {
        return map.getLayersByName("Stations")[0];
    };
    map.getPolySelectLayer = function () {
        return map.getLayersByName("Polygon selection")[0];
    };

    map.selectFeatureByFid = function (fid) {
        var feature = stationLayer.getFeatureByFid(fid);
        selectCtrl.select(feature);
    };
    map.unselectFeatureByFid = function (fid) {
        var feature = stationLayer.getFeatureByFid(fid);
        selectCtrl.unselect(feature);
    };
    map.unselectAll = function () {
        selectCtrl.unselectAll();
    };
    map.toggleSelectFeatureByFid = function (fid) {
        var feature = stationLayer.getFeatureByFid(fid);
        if ($.inArray(feature, stationLayer.selectedFeatures) === -1) {
            selectCtrl.select(feature);
        } else {
            selectCtrl.unselect(feature);
        }
    };

    map.getSelectedFids = function () {
        var i, fids = [], selected;
        selected = stationLayer.selectedFeatures;
        for (i = selected.length - 1; i >= 0; i -= 1) {
            fids.push(selected[i].fid);
        }
        return fids;
    };
    return map;
}

condExport(module, {
    init_hydro_stn_map: init_hydro_stn_map,
});
