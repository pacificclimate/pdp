function getNCWMSLayerCapabilities(ncwms_layer) {
    OpenLayers.Request.GET(
        {
            url: ncwms_layer.url,
            params: {
                REQUEST: "GetCapabilities",
                SERVICE: "WMS",
                VERSION: "1.1.1",
                DATASET: ncwms_layer.params.LAYERS.split('/')[0]
            },
            callback: function(response) {
                var xmldoc = $.parseXML(response.responseText);
                ncwmsCapabilities = $(xmldoc); // must be a global var
                getTimeAvailable(ncwms_layer);
            }
        }
    );
};

function autoScale(map, newVariable) {
    var dataBounds;

    if (newVariable) {
        // We use the bounding box of the whole layer
        dataBounds = bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3];
    } else {
        // Use the intersection of the viewport and the layer's bounding box
        dataBounds = getIntersectionBBOX();
    }
    getMinMax(activeLayer.server, {
        callback: gotMinMax,
        layerName: activeLayer.id,
        bbox: dataBounds,
        crs: map.baseLayer.projection.toString() // (projection is a Projection object)
        // time: isoTValue
    });
}

function getMinMax(url, params) {
    makeAjaxRequest(url, {
        urlparams: {
            item: 'minmax',
            layers: params.layerName,
            bbox: params.bbox,
            elevation: params.elevation,
            time: params.time,
            srs: params.crs,
            width: 50, // Request only a small box to save extracting lots of data
            height: 50,
            version: '1.1.1'
        },
        onSuccess: params.callback
    });
}

function gotMinMax(minmax)
{
    $('scaleMin').value = minmax.min.toPrecision(4);
    $('scaleMax').value = minmax.max.toPrecision(4);
    validateScale(); // This calls updateMap()
}

function setTimeAvailable(capabilities, layer) {
    //TODO: only present times available in ncwms capabilities for this layer
    
    // var stuff = ncwmsCapabilities.find('Layer > Name:contains("' + layer + '")').parent();
    // var date_range = $.trim(stuff.find('Extent[name="time"]').text()).split('/');
    // var begin = date_range[0].split('T', 1)[0].replace(/-/g, '/');
    // var end = date_range[1].split('T', 1)[0].replace(/-/g, '/');

    var begin = '1950/01/01';
    var end = '2050/12/31';
    $.each([".datepickerstart", ".datepickerend"], function(idx, val) {
        $(val).datepicker('option', 'minDate', begin);
        $(val).datepicker('option', 'maxDate', end);
        $(val).datepicker('option', 'yearRange', begin.split('/')[0] + ":" + end.split('/')[0]);
    });
    $(".datepicker").datepicker('setDate', begin);
    $(".datepickerstart").datepicker('setDate', begin);
    $(".datepickerend").datepicker('setDate', end);
};

function getTimeAvailable(ncwms_layer, callback) {
    maxTime = false;
    var id = ncwms_layer.params.LAYERS.split('/')[0];
    var url = (catalog[id] + '.dds?time').replace("/data/", "/catalog/");
    console.log(url);
    $.ajax({'url': url,
        'type': 'GET',
        'success': function(data, textStatus, jqXHR) {
            var n = data.match(/\[time.*]/g)[0].match(/\d+/)[0];
            maxTime = parseInt(n);
            if (callback) {
                callback(maxTime);
            };
        }
    });
}

function intersection(b1, b2) {
    // take the intersection of two OpenLayers.Bounds
    return new OpenLayers.Bounds(
        Math.max(b1.left, b2.left),
        Math.max(b1.bottom, b2.bottom),
        Math.min(b1.right, b2.right),
        Math.min(b1.top, b2.top)
    );
};

function getRasterNativeProj(capabilities, layer_name) { 
    // Return the dataset native projection as an OL.Projection object
    var bbox = capabilities.find('Layer > Name:contains("' + layer_name + '")').parent().find('BoundingBox')[0];
    var srs = new OpenLayers.Projection(bbox.attributes.SRS.value);
    return srs;
};

function getRasterBbox(capabilities, layer_name) { 
    // The WMS layer doesn't seem to have the bbox of the _data_ available, which I would like to have
    // Pull the geographic bounding box out of the appropriate element
    var bbox = capabilities.find('Layer > Name:contains("' + layer_name + '")').parent().find('LatLonBoundingBox')[0];
    var real_bounds = new OpenLayers.Bounds();
    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.minx.value), parseFloat(bbox.attributes.miny.value)));
    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.maxx.value), parseFloat(bbox.attributes.maxy.value)));
    return real_bounds;
};

function timeIndicies() {
    var base = new Date($(".datepickerstart").datepicker('option', 'minDate'));
    var t0 = $(".datepickerstart").datepicker('getDate');
    var tn = $(".datepickerend").datepicker('getDate');
    var t0i = (t0 - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
    var tni = (tn - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
    return [t0i, tni];
};

function rasterBBoxToIndicies(map, layer, bnds, extent_proj, extension, callback) {
    var indexBounds = new OpenLayers.Bounds();

    function responder(response) {
        var xmldoc = response.responseXML;
        var iIndex = parseInt($(xmldoc).find('iIndex').text());
        var jIndex = parseInt($(xmldoc).find('jIndex').text());
        if (!isNaN(indexBounds.toGeometry().getVertices()[0].x)) {
            indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
            callback(indexBounds)
        } else { // first response... wait for the second
            indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
        }
    };

    function requestIndex(x, y) {
        var params = {
            REQUEST: "GetFeatureInfo",
            BBOX: map.getExtent().toBBOX(),
            SERVICE: "WMS",
            VERSION: "1.1.1",
            X: x,
            Y: y,
            QUERY_LAYERS: layer.params.LAYERS,
            LAYERS: layer.params.LAYERS,
            WIDTH: map.size.w,
            HEIGHT: map.size.h,
            SRS: map.getProjectionObject(),
            INFO_FORMAT: 'text/xml'
        };
        // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
        OpenLayers.Request.GET({
            url: ncwms_url,
            params: params,
            callback: responder
        });
    };

    var ul = new OpenLayers.LonLat(bnds.left, bnds.top).transform(extent_proj, map.getProjectionObject());
    var lr = new OpenLayers.LonLat(bnds.right, bnds.bottom).transform(extent_proj, map.getProjectionObject());
    var ul_px = map.getPixelFromLonLat(ul);
    var lr_px = map.getPixelFromLonLat(lr);
    requestIndex(ul_px.x, ul_px.y);
    requestIndex(lr_px.x, lr_px.y);
}
