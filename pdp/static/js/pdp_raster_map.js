/*jslint browser: true, devel: true */
/*global pdp, $, OpenLayers, catalog, setTimeAvailable, handle_ie8_xml, DOMParser
*/

"use strict";

var CfTime = function (units, sDate) {
    this.units = units;
    this.sDate = sDate;
};
CfTime.prototype.setMaxTimeByIndex = function (index) {
    this.maxIndex =  index;
    this.eDate = this.toDate(index);
    return this.eDate;
};
CfTime.prototype.toDate = function (index) {
    if (index === undefined) {
        return this.sDate;
    }
    if (this.units === "days") {
        var d = new Date(this.sDate.getTime());
        d.setDate(this.sDate.getDate() + index);
        return d;
    }
};
CfTime.prototype.toIndex = function (d) {
    if (d < this.sDate || (this.eDate && this.eDate < d)) {
        return;
    }

    if (this.units === "days") {
        var msPerDay = 1000 * 60 * 60 * 24,
            msDiff = d.getTime() - this.sDate.getTime(),
            days = msDiff / msPerDay;
        return Math.floor(days);
    }
};

function getNcwmsLayerId(ncwms_layer) {
    return ncwms_layer.params.LAYERS.split("/")[0];
}

function ddsToTimeIndex(data) {
    var reg, match;
    reg = /\[time = (\d+)\]/g;
    match = reg.exec(data)[1];
    return parseInt(match, 10);
}

function dasToUnitsSince(data) {
    var s = data.match(/time \{[\s\S]*?\}/gm)[0],
        reg = /units \"((year|month|day|hour|minute|second)s?) since (\d{4}-\d{1,2}-\d{1,2} [\d:]+)\"/g,
        m = reg.exec(s),
        units = m[1],
        dateString = m[3],
        sDate;

    reg = /(\d{4})-(\d{1,2})-(\d{1,2})( |T)(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
    m = reg.exec(dateString);
    if (m) {
        sDate = new Date(m[1], parseInt(m[2], 10) + 1, // Account for 0 based month index in js
                         m[3], m[5], m[6], m[7], 0);
        return [units, sDate];
    }
    // Not ISO Format, maybe YYYY-MM-DD?
    reg = /(\d{4})-(\d{1,2})-(\d{1,2})/g;
    m = reg.exec(dateString);
    if (m) {
        return [units, new Date(m[1], parseInt(m[2], 10) + 1, m[3])];
    }
    // Well, crap.
    return undefined;
}

function getNCWMSLayerCapabilities(ncwms_layer) {

    // FIXME: this .ajax logic doesn't really work in all cases
    // What we really want is the fail() handler to _resolve_ the status,
    // and then have another fail() fallthrough handler .That is impossible, however.
    // see: http://domenic.me/2012/10/14/youre-missing-the-point-of-promises/

    var params = {
        REQUEST: "GetCapabilities",
        SERVICE: "WMS",
        VERSION: "1.1.1",
        DATASET: ncwms_layer.params.LAYERS.split("/")[0]
    };
    $.ajax({url: ncwms_layer.url,
            data: params,
           })
        .fail(handle_ie8_xml)
        .always(function (response, status, jqXHR) {
            window.ncwmsCapabilities = $(jqXHR.responseXML);
        });
}

function processNcwmsLayerMetadata(ncwms_layer) {

    var layerUrl, maxTimeReq, unitsSinceReq;

    getNCWMSLayerCapabilities(ncwms_layer);

    layerUrl = catalog[getNcwmsLayerId(ncwms_layer)];
    // Request time variables
    maxTimeReq = $.ajax({
        url: (layerUrl + ".dds?time").replace("/data/", "/catalog/")
    });

    unitsSinceReq = $.ajax({
        url: (layerUrl + ".das").replace("/data/", "/catalog/")
    });

    // Process times when both returned
    $.when(maxTimeReq, unitsSinceReq).done(function (maxTime, unitsSince) {

        var maxTimeIndex, units, startDate, layerTime;

        maxTimeIndex = ddsToTimeIndex(maxTime[0]);
        unitsSince = dasToUnitsSince(unitsSince[0]);
        units = unitsSince[0];
        startDate = unitsSince[1];
        layerTime = new CfTime(units, startDate);
        layerTime.setMaxTimeByIndex(maxTimeIndex);
        ncwms_layer.times = layerTime; // Future access through ncwmslayer?
        setTimeAvailable(layerTime.sDate, layerTime.eDate);
    });
}


function setTimeAvailable(begin, end) {
    //TODO: only present times available in ncwms capabilities for this layer

    $.each([".datepickerstart", ".datepickerend"], function (idx, val) {
        $(val).datepicker("option", "minDate", begin);
        $(val).datepicker("option", "maxDate", end);
    });
    $(".datepicker").datepicker("setDate", begin);
    $(".datepickerstart").datepicker("setDate", begin);
    $(".datepickerend").datepicker("setDate", end);
}

function intersection(b1, b2) {
    // take the intersection of two OpenLayers.Bounds
    return new OpenLayers.Bounds(
        Math.max(b1.left, b2.left),
        Math.max(b1.bottom, b2.bottom),
        Math.min(b1.right, b2.right),
        Math.min(b1.top, b2.top)
    );
}

function getRasterNativeProj(capabilities, layer_name) {
    // Return the dataset native projection as an OL.Projection object
    var bbox = capabilities.find('Layer > Name:contains("' + layer_name + '")').parent().find('BoundingBox')[0],
        srs = bbox.attributes.getNamedItem('SRS');
    return new OpenLayers.Projection(srs.value);
}

function getRasterBbox(capabilities, layer_name) {
    // The WMS layer doesn't seem to have the bbox of the _data_ available, which I would like to have
    // Pull the geographic bounding box out of the appropriate element
    var bbox = capabilities.find('Layer > Name:contains("' + layer_name + '")').parent().find('LatLonBoundingBox')[0],
        real_bounds = new OpenLayers.Bounds();
    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.getNamedItem('minx').value), parseFloat(bbox.attributes.getNamedItem('miny').value)));
    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.getNamedItem('maxx').value), parseFloat(bbox.attributes.getNamedItem('maxy').value)));
    return real_bounds;
}

function getTimeSelected(ncwms_layer) {
    //var base = new Date($(".datepickerstart").datepicker("option", "minDate")),
    var t0 = $(".datepickerstart").datepicker("getDate"),
        tn = $(".datepickerend").datepicker("getDate"),
    //  units = ncwms_layer.times.units,
        t0i = ncwms_layer.times.toIndex(t0),
        tni = ncwms_layer.times.toIndex(tn);
    return [t0i, tni];
}

function rasterBBoxToIndicies(map, layer, bnds, extent_proj, extension, callback) {
    var ul, lr, ul_px, lr_px,
        indexBounds = new OpenLayers.Bounds();

    function responder(data, status, response) {
        var xmldoc, iIndex, jIndex, parser;
        if (response.responseXML) {
            xmldoc = response.responseXML;
        } else {
            parser = new DOMParser();
            xmldoc = parser.parseFromString(response.responseText, 'text/xml');
        }
        iIndex = parseInt($(xmldoc).find("iIndex").text(), 10);
        jIndex = parseInt($(xmldoc).find("jIndex").text(), 10);
        // FIXME: This should be handled with a jquery $.when(req1, req2); this will simplify the code quite a bit
        if (!isNaN(indexBounds.toGeometry().getVertices()[0].x)) {
            indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
            callback(indexBounds);
        } else { // first response... wait for the second
            indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
        }
    }

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
            SRS: map.getProjectionObject().projCode,
            INFO_FORMAT: "text/xml"
        };
        // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
        $.ajax({url: pdp.ncwms_url[0],
                data: params})
            .fail(handle_ie8_xml)
            .always(responder);
            //.fail(function(){alert("Something has gone wrong with the download");});
    }

    ul = new OpenLayers.LonLat(bnds.left, bnds.top).transform(extent_proj, map.getProjectionObject());
    lr = new OpenLayers.LonLat(bnds.right, bnds.bottom).transform(extent_proj, map.getProjectionObject());
    ul_px = map.getPixelFromLonLat(ul);
    lr_px = map.getPixelFromLonLat(lr);
    requestIndex(ul_px.x, ul_px.y);
    requestIndex(lr_px.x, lr_px.y);
};
