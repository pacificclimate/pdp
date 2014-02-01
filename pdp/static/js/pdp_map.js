// Set standard map properties
function getProjection(projnum) {
    return new OpenLayers.Projection("EPSG:" + projnum);
}

function getBC3005Bounds() { 
    return new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25);
}

function getBC3005Bounds_vic() { 
    return new OpenLayers.Bounds(611014.125,251336.4375,2070975.0625,1737664.5625);
}

function getNA4326Bounds() {
    return new OpenLayers.Bounds(-150,40,-50,90);
}

function getWorld4326Bounds() {
    return new OpenLayers.Bounds(-180,-90,180,90);
}

function getBC3005Resolutions() {
    return [2218.5, 1109.25, 554.625, 277.3125, 138.6562, 69.32812, 34.66406]
}

function BC3005_map_options() {
    bounds = getBC3005Bounds()

    var options = {
        restrictedExtent: bounds,
        displayProjection: getProjection(4326),
        projection: getProjection(3005),
        units: 'Meter'
    };
    return options
}

function BC3005_map_options_vic() {
    bounds = getBC3005Bounds_vic()

    var options = {
        restrictedExtent: bounds,
        displayProjection: getProjection(4326),
        projection: getProjection(3005),
        units: 'Meter'
    };
    return options
}

function na4326_map_options() {
    bounds = getNA4326Bounds();
    projection = getProjection(4326);

    var options = {
        restrictedExtent: bounds,
        units: 'degrees',
        displayProjection: projection,
        projection: projection,
    };
    return options
}

function world4326_map_options() {
    bounds = getWorld4326Bounds()
    projection = getProjection(4326)

    var options = {
        restrictedExtent: bounds,
        displayProjection: projection,
        maxResolution: 0.703125,
        numZoomLevels: 15,
        projection: projection,
        units: 'degrees'
    };
    return options
}

function getGSBaseLayer(gs_url, displayname, layername) {
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
            attribution: '© OpenStreetMap contributors'
        }
    );
}

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
            attribution: '© OpenStreetMap contributors'
        }
    );
}

function getTileBaseLayer(tilesurl, displayname, layername, proj) {
    /* tilesurl something like "http://medusa.pcic.uvic.ca/tilecache/tilecache.py/1.0.0" */
    return new OpenLayers.Layer.XYZ(
        displayname,
        tilesurl + "/" + layername + "/${z}/${x}/${y}.png",
        {
            projection: proj,
            zoomOffset:4,
            attribution: '© OpenStreetMap contributors'
        }
    );
}

function getBC3005OsmBaseLayer(wmsurl, displayname, layername) {
    return new OpenLayers.Layer.WMS(
        displayname,
        wmsurl,
        {
            layers: layername
        },
        {
            projection: getProjection(3005),
            units: 'Meter',
            maxExtent: new OpenLayers.Bounds(-1000000,-1000000,3000000,3000000),
            maxResolution: 7812.5,
            numZoomLevels: 12,
            attribution: '© OpenStreetMap contributors'
        })
}

function getBasicControls() {
    return [
        new OpenLayers.Control.LayerSwitcher({'ascending':false}),
        new OpenLayers.Control.ScaleLine({geodesic: true}),
        new OpenLayers.Control.KeyboardDefaults(),
        new OpenLayers.Control.MousePosition({div: $('#location')[0]}),
        new OpenLayers.Control.PanZoomBar({panIcons:true}),
        new OpenLayers.Control.Attribution()
    ]
}

function getEditingToolbar(controls) {
    var toolbar = new OpenLayers.Control.Panel(
        {
            displayClass: 'olControlEditingToolbar',
            defaultControl: controls[0]
        }
    );
    toolbar.addControls(controls);
    return toolbar;
}

function getHandNav() {
    return new OpenLayers.Control.Navigation(
        {
            handleRightClicks:true,
            zoomBox: new OpenLayers.Control.ZoomBox(),
            enabled: true,
            selected: true
        }
    );
}

function getPolygonLayer() {
    return new OpenLayers.Layer.Vector(
        "Polygon selection",
        {
            'geometryType': OpenLayers.Geometry.Polygon
        }
    );
} 

function getBoxLayer(name) {
    name = typeof name !== 'undefined' ? name : "Box selection";
    var boxLayer = new OpenLayers.Layer.Vector(name);
    // Allow only one rectangle at a time
    boxLayer.events.register(
        'beforefeatureadded',
        boxLayer,
        function(evt) {
            this.removeAllFeatures();
            boxLayer.ncbounds = new OpenLayers.Bounds();
        }
    );
    boxLayer.events.register(
        'featureadded',
        boxLayer,
        function(evt) {
            selectionBbox = this.features[0].geometry.getBounds();
        }
    );
    return boxLayer
}

function getPolyEditor(poly) {    
    return new OpenLayers.Control.DrawFeature(
        poly,
        OpenLayers.Handler.Polygon, {
            'displayClass': 'olControlDrawFeaturePolygon'
        }
    );
}

function getBoxEditor(box) {
    return new OpenLayers.Control.DrawFeature(
        box,
        OpenLayers.Handler.RegularPolygon, {
            handlerOptions: {
                sides: 4, irregular: true
            },
            displayClass: 'olControlDrawFeaturePolygon'
        }
    );
}

var getOpacitySlider = function(layer) {

    // Container
    var sliderContainer = document.createElement('div');
    sliderContainer.className = "opacitySliderContainer";
    sliderContainer.style.padding = "0.5em";
    
    // Title
    var sliderTitle = document.createElement('div');
    sliderTitle.className = "opacitySliderTitle";
    sliderTitle.innerHTML = 'Climate Layer Opacity';
    sliderTitle.setAttribute("unselectable", "on");
    sliderTitle.className += " unselectable";
    sliderTitle.style.display = "block";
    sliderTitle.style.marginBottom = "0.5em";
    sliderTitle.style.padding = "0 2em"
    sliderTitle.style.fontWeight = "bold"

    sliderContainer.appendChild(sliderTitle);

    // Slider Element
    var sliderElement = document.createElement('div');
    sliderElement.style.position = "relative";
    sliderElement.style.marginBottom = "0.5em"
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

function addLoadingIcon(layer) {
    $("#map-wrapper").append('<div id="loading" class="invisible"><center>\
<img src="' + pdp.app_root + '/images/loading.gif" alt="Layer loading animation" /><p>Loading...</p>\
</center></div>');
    layer.events.register('loadstart',
                          $("#loading"),
                          function(evt) {this.removeClass("invisible");});
    layer.events.register('loadend',
                          $("#loading"),
                          function(evt) {this.addClass("invisible");});
}
