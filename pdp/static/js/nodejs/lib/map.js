// pdp maps library

/*jshint browser: true*/
/* global $, OpenLayers, pdp */

"use strict";

var getProjection = function (projnum) {
    return new OpenLayers.Projection("EPSG:" + projnum);
};

var getBC3005Bounds = function () { 
    return new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25);
};
exports.getBC3005Bounds = getBC3005Bounds;

var getBC3005Bounds_vic = function () { 
    return new OpenLayers.Bounds(611014.125,251336.4375,2070975.0625,1737664.5625);
};
exports.getBC3005Bounds_vic = getBC3005Bounds_vic;

var getNA4326Bounds = function () {
    return new OpenLayers.Bounds(-150,40,-50,90);
};

var BC3005_map_options = function () {
    var bounds = getBC3005Bounds();

    var options = {
        restrictedExtent: bounds,
        displayProjection: getProjection(4326),
        projection: getProjection(3005),
        units: "Meter"
    };
    return options;
};
exports.BC3005_map_options = BC3005_map_options;

var BC3005_map_options_vic = function () {
    var bounds = getBC3005Bounds_vic();

    var options = {
        restrictedExtent: bounds,
        displayProjection: getProjection(4326),
        projection: getProjection(3005),
        units: "Meter"
    };
    return options;
};
exports.BC3005_map_options_vic = BC3005_map_options_vic;

var na4326_map_options = function () {
    var bounds = getNA4326Bounds();
    var projection = getProjection(4326);

    var options = {
        restrictedExtent: bounds,
        units: "degrees",
        displayProjection: projection,
        projection: projection,
    };
    return options;
};
exports.na4326_map_options = na4326_map_options;

var getGSBaseLayer = function (gs_url, displayname, layername) {
    return new OpenLayers.Layer.WMS(
        displayname,
        gs_url + "gwc/service/wms",
        {
            layers: layername,
            transparent: true
        },{
            isBaseLayer:true,
            restrictedExtent: new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25),
            maxExtent: new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25),
            resolutions: [2218.5, 1109.25, 554.625, 277.3125, 138.6562, 69.32812, 34.66406],
            attribution: "© OpenStreetMap contributors"
        }
    );
};
exports.getGSBaseLayer = getGSBaseLayer;

function getNaBaseLayer(wmsurl, displayname, layername, proj) {
    return new OpenLayers.Layer.WMS(
        displayname,
        wmsurl,
        {
            layers: layername,
        },{
            projection: proj,
            maxResolution: 1.40625,
            numZoomLevels: 10,
            attribution: "© OpenStreetMap contributors"
        }
    );
}
exports.getNaBaseLayer = getNaBaseLayer;

var getBC3005OsmBaseLayer = function (wmsurl, displayname, layername) {
    return new OpenLayers.Layer.WMS(
        displayname,
        wmsurl,
        {
            layers: layername
        },
        {
            projection: getProjection(3005),
            units: "Meter",
            maxExtent: new OpenLayers.Bounds(-1000000,-1000000,3000000,3000000),
            maxResolution: 7812.5,
            numZoomLevels: 12,
            attribution: "© OpenStreetMap contributors"
        });
};
exports.getBC3005OsmBaseLayer = getBC3005OsmBaseLayer;

var getBasicControls = function () {
    return [
        new OpenLayers.Control.LayerSwitcher({"ascending":false}),
        new OpenLayers.Control.ScaleLine({geodesic: true}),
        new OpenLayers.Control.KeyboardDefaults(),
        new OpenLayers.Control.MousePosition({div: $("#location")[0]}),
        new OpenLayers.Control.PanZoomBar({panIcons:true}),
        new OpenLayers.Control.Attribution()
    ];
};
exports.getBasicControls = getBasicControls;

var getEditingToolbar = function (controls) {
    var toolbar = new OpenLayers.Control.Panel(
        {
            displayClass: "olControlEditingToolbar",
            defaultControl: controls[0]
        }
    );
    toolbar.addControls(controls);
    return toolbar;
};
exports.getEditingToolbar = getEditingToolbar;

var getHandNav = function () {
    return new OpenLayers.Control.Navigation(
        {
            handleRightClicks:true,
            zoomBox: new OpenLayers.Control.ZoomBox(),
            enabled: true,
            selected: true
        }
    );
};
exports.getHandNav = getHandNav;

var getPolygonLayer = function () {
    return new OpenLayers.Layer.Vector(
        "Polygon selection",
        {
            "geometryType": OpenLayers.Geometry.Polygon
        }
    );
};
exports.getPolygonLayer = getPolygonLayer;

var getBoxLayer = function (name) {
    name = typeof name !== "undefined" ? name : "Box selection";
    var boxLayer = new OpenLayers.Layer.Vector(name);
    // Allow only one rectangle at a time
    boxLayer.events.register(
        "beforefeatureadded",
        boxLayer,
        function() {
            this.removeAllFeatures();
            boxLayer.ncbounds = new OpenLayers.Bounds();
        }
    );
    boxLayer.events.register(
        "featureadded",
        boxLayer,
        function() {
            var selectionBbox = this.features[0].geometry.getBounds();
        }
    );
    return boxLayer;
};
exports.getBoxLayer = getBoxLayer;

var getPolyEditor = function (poly) {    
    return new OpenLayers.Control.DrawFeature(
        poly,
        OpenLayers.Handler.Polygon, {
            "displayClass": "olControlDrawFeaturePolygon"
        }
    );
};
exports.getPolyEditor = getPolyEditor;

var getBoxEditor = function (box) {
    return new OpenLayers.Control.DrawFeature(
        box,
        OpenLayers.Handler.RegularPolygon, {
            handlerOptions: {
                sides: 4, irregular: true
            },
            displayClass: "olControlDrawFeaturePolygon"
        }
    );
};
exports.getBoxEditor = getBoxEditor;

var getOpacitySlider = function(layer) {

    // Container
    var sliderContainer = document.createElement("div");
    sliderContainer.className = "opacitySliderContainer";
    sliderContainer.style.padding = "0.5em";
    
    // Title
    var sliderTitle = document.createElement("div");
    sliderTitle.className = "opacitySliderTitle";
    sliderTitle.innerHTML = "Climate Layer Opacity";
    sliderTitle.setAttribute("unselectable", "on");
    sliderTitle.className += " unselectable";
    sliderTitle.style.display = "block";
    sliderTitle.style.marginBottom = "0.5em";
    sliderTitle.style.padding = "0 2em";
    sliderTitle.style.fontWeight = "bold";

    sliderContainer.appendChild(sliderTitle);

    // Slider Element
    var sliderElement = document.createElement("div");
    sliderElement.style.position = "relative";
    sliderElement.style.marginBottom = "0.5em";
    sliderElement.className = "opacitySliderElement";
    sliderContainer.appendChild(sliderElement);

    // init Slider
    $(sliderElement).slider({
        animate: "fast",
        range: "min",
        min: 0,
        value: 70,
        slide: function(e, ui) {
            layer.setOpacity(ui.value / 100);
        }
    });

    return sliderContainer;
};
exports.getOpacitySlider = getOpacitySlider;

var addLoadingIcon = function (layer) {
    $("#map-wrapper").append("<div id=\"loading\" class=\"invisible\"><center><img src=\"" + pdp.app_root + "/images/loading.gif\" alt=\"Layer loading animation\" /><p>Loading...</p></center></div>");
    layer.events.register("loadstart",
                          $("#loading"),
                          function() {this.removeClass("invisible");});
    layer.events.register("loadend",
                          $("#loading"),
                          function() {this.addClass("invisible");});
};
exports.addLoadingIcon = addLoadingIcon;
