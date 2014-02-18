var cfTime = function(units, sDate) {
    this.units = units;
    this.sDate = sDate;
};
cfTime.prototype.setMaxTimeByIndex = function(index) {
    this.maxIndex =  index;
    this.eDate = this.toDate(index);
    return this.eDate;
};
cfTime.prototype.toDate = function(index) {
    if (typeof(index) == "undefined") {
        return this.sDate;
    }
    if (this.units == "days") {
        var d = new Date(this.sDate.getTime());
        d.setDate(this.sDate.getDate() + index);
        return d;
    }
};
cfTime.prototype.toIndex = function(d) {
    if (d < this.sDate || (this.eDate && this.eDate < d)) {
        return;
    }

    if (this.units == "days") {
        var msPerDay = 1000 * 60 * 60 * 24;
        var msDiff = d.getTime() - this.sDate.getTime();
        var days = msDiff / msPerDay;
        return days;
    }
};

var processNcwmsLayerMetadata = function(ncwms_layer) {
    getNCWMSLayerCapabilities(ncwms_layer);

    var layerUrl = catalog[getNcwmsLayerId(ncwms_layer)];
    // Request time variables
    var maxTimeReq = $.ajax({
        url: (layerUrl + ".dds?time").replace("/data/", "/catalog/")
    });

    var unitsSinceReq = $.ajax({
        url: (layerUrl + ".das").replace("/data/", "/catalog/")
    });

    // Process times when both returned
    $.when(maxTimeReq, unitsSinceReq).done (function(maxTime, unitsSince) {
        var maxTimeIndex = ddsToTimeIndex(maxTime[0]);
        unitsSince = dasToUnitsSince(unitsSince[0]);
        var units = unitsSince[0];
        var startDate = unitsSince[1];
        var layerTime = new cfTime(units, startDate);
        layerTime.setMaxTimeByIndex(maxTimeIndex);
        ncwms_layer.times = layerTime; // Future access through ncwmslayer?
        setTimeAvailable(layerTime.sDate, layerTime.eDate);
    });
};

var getNcwmsLayerId = function(ncwms_layer) {
    return ncwms_layer.params.LAYERS.split("/")[0];
};

var ddsToTimeIndex = function(data) {
    return parseInt(data.match(/\[time.*]/g)[0].match(/\d+/)[0], 10);
};

var dasToUnitsSince = function(data) {
    var s = data.match(/time \{[\s\S]*?\}/gm)[0];
    var reg = /\"(.*?) since (.*?)\"/g;
    var m = reg.exec(s);
    var units = m[1];
    var dateString = m[2];
    
    reg = /(\d{4})-(\d{2}|\d)-(\d{2}|\d)( |T)(\d{2}|\d):(\d{2}|\d):(\d{2}|\d)/g;
    m = reg.exec(dateString);
    if(!m) { // Not ISO Format, hope it's just YYYY-MM-DD
        reg = /(\d{4})-(\d{2}|\d)-(\d{2}|\d)/g;
         m = reg.exec(dateString);
         if(m) { return [units, new Date(m[0])]; }
    } else {
        for (var i = 0; i < m.length; i++) { m[i] = +m[i]; }
        var sDate = new Date(m[1], --m[2], m[3], m[5], m[6], m[7], 0); // Account for 0 based month index in js
        return [units, sDate];
    }
};

var getNCWMSLayerCapabilities = function(ncwms_layer) {
    OpenLayers.Request.GET(
        {
            url: ncwms_layer.url,
            params: {
                REQUEST: "GetCapabilities",
                SERVICE: "WMS",
                VERSION: "1.1.1",
                DATASET: ncwms_layer.params.LAYERS.split("/")[0]
            },
            callback: function(response) {
                var xmldoc = $.parseXML(response.responseText);
                ncwmsCapabilities = $(xmldoc); // must be a global var
            }
        }
    );
};

var setTimeAvailable = function(begin, end) {
    //TODO: only present times available in ncwms capabilities for this layer
    
    $.each([".datepickerstart", ".datepickerend"], function(idx, val) {
        $(val).datepicker("option", "minDate", begin);
        $(val).datepicker("option", "maxDate", end);
    });
    $(".datepicker").datepicker("setDate", begin);
    $(".datepickerstart").datepicker("setDate", begin);
    $(".datepickerend").datepicker("setDate", end);
};

var intersection = function(b1, b2) {
    // take the intersection of two OpenLayers.Bounds
    return new OpenLayers.Bounds(
        Math.max(b1.left, b2.left),
        Math.max(b1.bottom, b2.bottom),
        Math.min(b1.right, b2.right),
        Math.min(b1.top, b2.top)
    );
};

var getRasterNativeProj = function(capabilities, layer_name) {
    // Return the dataset native projection as an OL.Projection object
    var bbox = capabilities.find('Layer > Name:contains("' + layer_name + '")').parent().find('BoundingBox')[0];
    var srs = new OpenLayers.Projection(bbox.attributes.SRS.value);
    return srs;
};

var getRasterBbox = function(capabilities, layer_name) {
    // The WMS layer doesn't seem to have the bbox of the _data_ available, which I would like to have
    // Pull the geographic bounding box out of the appropriate element
    var bbox = capabilities.find('Layer > Name:contains("' + layer_name + '")').parent().find('LatLonBoundingBox')[0];
    var real_bounds = new OpenLayers.Bounds();
    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.minx.value), parseFloat(bbox.attributes.miny.value)));
    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.maxx.value), parseFloat(bbox.attributes.maxy.value)));
    return real_bounds;
};

var getTimeSelected = function() {
    var base = new Date($(".datepickerstart").datepicker("option", "minDate"));
    var t0 = $(".datepickerstart").datepicker("getDate");
    var tn = $(".datepickerend").datepicker("getDate");
    var t0i = (t0 - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
    var tni = (tn - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
    return [t0i, Math.ceil(tni)]; //Ceiling to work around DST
};

var rasterBBoxToIndicies = function (map, layer, bnds, extent_proj, extension, callback) {
    var indexBounds = new OpenLayers.Bounds();

    var responder = function(response) {
        var xmldoc;
        if (response.responseXML) {
            xmldoc = response.responseXML;
        } else {
            var parser = new DOMParser();
            xmldoc = parser.parseFromString(response.responseText, 'text/xml');
        }
        var iIndex = parseInt($(xmldoc).find("iIndex").text());
        var jIndex = parseInt($(xmldoc).find("jIndex").text());
        if (!isNaN(indexBounds.toGeometry().getVertices()[0].x)) {
            indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
            callback(indexBounds);
        } else { // first response... wait for the second
            indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
        }
    };

    var requestIndex = function(x, y) {
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
            INFO_FORMAT: "text/xml"
        };
        // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
        OpenLayers.Request.GET({
            url: pdp.ncwms_url[0],
            params: params,
            success: responder,
            failure: function(){alert("Something has gone wrong with the download");}
        });
    };

    var ul = new OpenLayers.LonLat(bnds.left, bnds.top).transform(extent_proj, map.getProjectionObject());
    var lr = new OpenLayers.LonLat(bnds.right, bnds.bottom).transform(extent_proj, map.getProjectionObject());
    var ul_px = map.getPixelFromLonLat(ul);
    var lr_px = map.getPixelFromLonLat(lr);
    requestIndex(ul_px.x, ul_px.y);
    requestIndex(lr_px.x, lr_px.y);
};
