function cfTime(units, sDate) {
    this.units = units;
    this.sDate = sDate;
}
cfTime.prototype.setMaxTimeByIndex = function(index) {
    this.maxIndex =  index;
    this.eDate = this.toDate(index);
    return this.eDate;
}
cfTime.prototype.toDate = function(index) {
    if (typeof(index) == "undefined") {
        return this.sDate;
    }
    if (this.units == "days") {
        var d = new Date(this.sDate.getTime());
        d.setDate(this.sDate.getDate() + index);
        return d;
    }
}
cfTime.prototype.toIndex = function(d) {
    if (d < this.sDate || (this.eDate && this.eDate < d)) {
        console.error("Invalid Date");
        return;
    }

    if (this.units == "days") {
        var msPerDay = 1000 * 60 * 60 * 24;
        var msDiff = d.getTime() - this.sDate.getTime();
        var days = msDiff / msPerDay;
        return days;
    }
}

function processNcwmsLayerMetadata(ncwms_layer) {
    getNCWMSLayerCapabilities(ncwms_layer);

    var layerUrl = catalog[getNcwmsLayerId(ncwms_layer)]
    // Request time variables
    maxTimeReq = $.ajax({
        'url': (layerUrl + '.dds?time').replace("/data/", "/catalog/")
    });

    unitsSinceReq = $.ajax({
        'url': (layerUrl + '.das').replace("/data/", "/catalog/")
    });

    // Process times when both returned
    $.when(maxTimeReq, unitsSinceReq).done (function(maxTime, unitsSince) {
        var maxTimeIndex = ddsToTimeIndex(maxTime[0]);
        var unitsSince = dasToUnitsSince(unitsSince[0]);
        var units = unitsSince[0];
        var startDate = unitsSince[1];
        var layerTime = new cfTime(units, startDate);
        layerTime.setMaxTimeByIndex(maxTimeIndex);
        ncwms_layer.times = layerTime; // Future access through ncwmslayer?
        setTimeAvailable(layerTime.sDate, layerTime.eDate);
    });
}

function getNcwmsLayerId(ncwms_layer) {
    return ncwms_layer.params.LAYERS.split('/')[0];
}

function ddsToTimeIndex(data) {
    return parseInt(data.match(/\[time.*]/g)[0].match(/\d+/)[0]);
}

function dasToUnitsSince(data) {
    var s = data.match(/time \{[\s\S]*?\}/gm)[0];
    var reg = /\"(.*?) since (.*?)\"/g;
    var m = reg.exec(s);
    return [m[1], new Date(m[2])];
}

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

function setTimeAvailable(begin, end) {
    //TODO: only present times available in ncwms capabilities for this layer
    
    $.each([".datepickerstart", ".datepickerend"], function(idx, val) {
        $(val).datepicker('option', 'minDate', begin);
        $(val).datepicker('option', 'maxDate', end);
        $(val).datepicker('option', 'yearRange', begin.getFullYear() + ":" + end.getFullYear());
    });
    $(".datepicker").datepicker('setDate', begin);
    $(".datepickerstart").datepicker('setDate', begin);
    $(".datepickerend").datepicker('setDate', end);
};

function getMaxTimeIndex(ncwms_layer, callback) {
    var url = (catalog[getNcwmsLayerId(ncwms_layer)] + '.dds?time').replace("/data/", "/catalog/");
    $.ajax({
        'url': url
    }).done(function(data) {
        var n = data.match(/\[time.*]/g)[0].match(/\d+/)[0];
        if (callback) {
            callback(parseInt(n));
        };
    });
}

function getTimeUnits(ncwms_layer, callback) {
    // Based on the DAS, executes a callback with the parsed time units.
    // Relies upon time varialbe of dataset to be stored in variable 'time' and 
    // using units "(timeinterval) since (date)"
    var url = (catalog[catalog[getNcwmsLayerId(ncwms_layer)]] + '.das').replace("/data/", "/catalog/");
    $.ajax({
        'url': url
    }).done(function(data) {
        var s = data.match(/time \{[\s\S]*?\}/gm)[0];
        var reg = /\"(.*?) since (.*?)\"/g;
        var match = reg.exec(s);
        if (callback) {
            callback([match[1]], Date(match[2]));
        };
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

function getTimeSelected() {
    var base = new Date($(".datepickerstart").datepicker('option', 'minDate'));
    var t0 = $(".datepickerstart").datepicker('getDate');
    var tn = $(".datepickerend").datepicker('getDate');
    var t0i = (t0 - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
    var tni = (tn - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
    return [t0i, Math.ceil(tni)]; //Ceiling to work around DST
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
