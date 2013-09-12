// Set standard map properties
function getProjection(projnum) {
    return new OpenLayers.Projection("EPSG:" + projnum);
}

function getBC3005Bounds() { 
    return new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25);
}

function getNA4326Bounds() {
    return new OpenLayers.Bounds(-150,30,-50,90);
}

function getWorld4326Bounds() {
    return new OpenLayers.Bounds(-180,-90,180,90);
}

function getBC3005Resolutions() {
    return [2218.5, 1109.25, 554.625, 277.3125, 138.6562, 69.32812, 34.66406]
}

function BC3005_map_options() {
    bounds = getBC3005Bounds()
    resolutions = getBC3005Resolutions()

    var options = {
        maxExtent: bounds,
        restrictedExtent: bounds,
        displayProjection: getProjection(4326),
        maxResolution: resolutions[0],
        resolutions: resolutions,
        projection: getProjection(3005),
        units: 'Meter'
    };
    return options
}

function na4326_map_options() {
    bounds = getNA4326Bounds()
    projection = getProjection(4326)

    var options = {
        restrictedExtent: bounds,
        displayProjection: projection,
        maxResolution: 0.087890625,
        numZoomLevels: 9,
        projection: projection,
        units: 'degrees'
    };
    return options
}

function world4326_map_options() {
    bounds = getWorld4326Bounds
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
            isBaseLayer:true
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
            zoomOffset:4
        }
    );
}

function getBasicControls() {
    return [
        new OpenLayers.Control.LayerSwitcher({'ascending':false}),
        new OpenLayers.Control.ScaleLine({geodesic: true}),
        new OpenLayers.Control.KeyboardDefaults(),
        new OpenLayers.Control.MousePosition({div: $('#location')[0]}),
        new OpenLayers.Control.PanZoomBar({panIcons:true})
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

function getBoxLayer() {
    var boxLayer = new OpenLayers.Layer.Vector("Box selection");
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

function getSlider(layer) {
    return new OpenLayers.Control.OpacitySlider(
        {
            layerToOpacisize: layer
        }
    );
}

function addLoadingIcon(layer) {
    $("#map-wrapper").append('<div id="loading" class="invisible"><center>\
<img src="' + app_root + '/images/loading.gif" alt="Layer loading animation" /><p>Loading...</p>\
</center></div>');
    layer.events.register('loadstart',
                          $("#loading"),
                          function(evt) {this.removeClass("invisible");});
    layer.events.register('loadend',
                          $("#loading"),
                          function(evt) {this.addClass("invisible");});
}
