/*jslint browser: true, devel: true */
/*global pdp, $, OpenLayers, setTimeAvailable, handle_ie8_xml, DOMParser
*/

"use strict";

var CfTime = function (units, sDate, calendar) {
    this.units = units;
    this.sDate = sDate;
    this.calendar = calendar ? calendar : "standard";

    switch(this.calendar) {
    case "360_day":
        this.constantDaysPerYear = 360;
        break;
    case "365_day":
    case "noleap":
        this.constantDaysPerYear = 365;
        break;
    default:
        this.constantDaysPerYear = undefined;
    }
};

CfTime.prototype.setMaxTimeByIndex = function (index) {
    this.maxIndex =  index;
    this.eDate = this.toDate(index);
    return this.eDate;
};

CfTime.prototype.toDate = function(index) {
    // Is `index` 0-based or 1-based????
    // And is this the same for standard/gregorian calendars and other calendars?

    // It looks as if this code's purpose is to add `index` time units
    // (e.g., days) to `this.sDate`, respecting the `this.calendar`.
    // Therefore index is 0-based

    if (index === undefined) {
        return this.sDate;
    }
    var result = new Date(this.sDate.getTime());
    // NB: This only works for units === 'days'!!!
    if(this.units == "days") {
        if(["standard", "gregorian", "proleptic_gregorian"].includes(this.calendar)) {
            result.setDate(this.sDate.getDate() + index);
            // getDate() returns day of month (origin 1)
            // setDate() sets day relative to first day of month (origin 1)
            // So this code adds `index` days to `sDate`
            return result;
        }
        else if(this.constantDaysPerYear) {
            // This branch is taken for at least one off-by-one case.
            // What is this code actually doing??

            // What should it be doing?
            // That depends in part on what the JS Date object does.
            //  -   The JS Date object always works on a standard/gregorian
            //      calendar.
            //  -   To add a certain number of days in a calendar with a
            //      fixed number of days

            // Add `index` days worth of a year to `sDate`, dropping any partial extra year.
            result.setFullYear(this.sDate.getFullYear() + Math.floor(index / this.constantDaysPerYear));

            // Holy shit.
            var msPerDay = 1000*60*60*24;
            var daysAlready = (result.getTime() - new Date(result.getFullYear(), 0, 1).getTime() ) / msPerDay;
            var dayRemainder = (index % this.constantDaysPerYear) + daysAlready;
            if(dayRemainder >= this.constantDaysPerYear) {
                result.setFullYear(result.getFullYear() + 1);
                dayRemainder = dayRemainder - this.constantDaysPerYear;
            }
            dayRemainder += Math.floor((dayRemainder / this.constantDaysPerYear) * (365.242 - this.constantDaysPerYear));
            result.setTime(result.getTime() + dayRemainder);
            return result;
        }
    }
};

CfTime.prototype.toIndex = function (d) {
    if (d < this.sDate || (this.eDate && this.eDate < d)) {
        return;
    }
    var days;
    var msPerDay = 1000 * 60 * 60 * 24;
    if(this.units=="days") {
        if(["standard", "gregorian", "proleptic_gregorian"].includes(this.calendar)) {
            var msDiff = d.getTime() - this.sDate.getTime();
            days = Math.floor(msDiff / msPerDay);
        }
        else if(this.constantDaysPerYear) {
            days = (d.getFullYear() - this.sDate.getFullYear()) * this.constantDaysPerYear;
            var remainderDate  = new Date(d);
            remainderDate.setFullYear(this.sDate.getFullYear());
            var remainderDays = Math.floor((remainderDate.getTime() - this.sDate.getTime()) / msPerDay);
            days += remainderDays;
            days -= Math.floor((remainderDays / this.constantDaysPerYear) * (365.242 - this.constantDaysPerYear));
            days = Math.floor(days);
        }
        return days;
    }
};

function getNcwmsLayerId(ncwms_layer) {
    return ncwms_layer.params.LAYERS.split("/")[0];
}

function ddsToTimeIndex(data) {
    var reg, match;
    reg = /\[time = (\d+)\]/g;
    match = reg.exec(data)[1];
    return parseInt(match, 10);  // FIXME: Problem here?
}

function dasToUnitsSince(data) {
    var s = data.match(/time \{[\s\S]*?\}/gm)[0],
        // Why not ".*?" ??
        // Will fail with 'T' separator, which code below accepts
        reg = /units \"((year|month|day|hour|minute|second)s?) since (\d{4}-\d{1,2}-\d{1,2} ?[\d:]*)\"/g,
        // Sloppy matching on time portion of datetime string
        m = reg.exec(s),
        units = m[1],
        dateString = m[3],
        sDate;
    // Provisionally OK, modulo questions

    var calendar;
    reg = /calendar \"(standard|gregorian|proleptic_gregorian|365_day|noleap|360_day)\"/,
    m = reg.exec(s),
    calendar = m ? m[1] : "standard";
    // Provisionally OK

    reg = /(\d{4})-(\d{1,2})-(\d{1,2})( |T)(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
    // Loose full ISO-8601 datetime; strictly:
    // - space is not allowed as separator
    // - months and days must have 2 digits
    m = reg.exec(dateString);
    if (m) {
        sDate = new Date(m[1], parseInt(m[2], 10) - 1, // Months in das result are 1-12, js needs 0-11
                         m[3], m[5], m[6], m[7], 0);
        return [units, sDate, calendar];
    }
    // Above probably works

    // Not ISO Format, maybe YYYY-MM-DD?
    // This IS loose ISO 8601, date only format
    reg = /(\d{4})-(\d{1,2})-(\d{1,2})/g;
    m = reg.exec(dateString);
    if (m) {
        return [units, new Date(m[1], parseInt(m[2], 10) - 1, m[3]), calendar];
    }
    // Above probably works
    // This most common case

    // Why are these 2 separate cases?? DRY.

    // Well, crap.
    return undefined;
}

function getNCWMSLayerCapabilities(ncwms_layer) {

    // FIXME: this .ajax logic doesn't really work in all cases
    // What we really want is the fail() handler to _resolve_ the status,
    // and then have another fail() fallthrough handler .That is impossible, however.
    // see: http://domenic.me/2012/10/14/youre-missing-the-point-of-promises/

    var deferred = $.Deferred();

    var params = {
        REQUEST: "GetCapabilities",
        SERVICE: "WMS",
        VERSION: "1.1.1",
        DATASET: ncwms_layer.params.LAYERS.split("/")[0]
    };

    $.ajax({
        url: ncwms_layer.url,
        data: params,
    })
    .fail(handle_ie8_xml)
    .always(function (response, status, jqXHR) {
        deferred.resolve($(jqXHR.responseXML));
    });

    return deferred.promise();
}

function processNcwmsLayerMetadata(ncwms_layer, catalog) {
    var layerUrl, maxTimeReq, unitsSinceReq, calendar;

    // transform the data_server url into the un-authed catalog based url for metadata
    layerUrl = catalog[getNcwmsLayerId(ncwms_layer)];
    //matches[1] is portal base url, matches[2] is dataset, make catalog url

    // Request time variables
    maxTimeReq = $.ajax({
        url: (layerUrl + ".dds?time")
    });

    unitsSinceReq = $.ajax({
        url: (layerUrl + ".das")
    });

    // Process times when both returned
    $.when(maxTimeReq, unitsSinceReq).done(function (maxTime, unitsSince) {
        var maxTimeIndex, units, startDate, layerTime;

        maxTimeIndex = ddsToTimeIndex(maxTime[0]);
        // This is not max time index, it is number of time indices.

        unitsSince = dasToUnitsSince(unitsSince[0]);
        units = unitsSince[0];
        startDate = unitsSince[1];
        calendar = unitsSince[2];
        layerTime = new CfTime(units, startDate, calendar);

        layerTime.setMaxTimeByIndex(maxTimeIndex);
        // setMaxTimeByIndex could be culprit here? Especially if it believes
        // maxTimeIndex is the max index not the index count.

        // See also CfTime.toDate, .toIndex -- are these really inverses of each other?

        ncwms_layer.times = layerTime; // Future access through ncwmslayer?
        // If page has datepicker(s), set them up.
        if ($(".datepickerstart").length > 0) {
            setTimeAvailable(layerTime.sDate, layerTime.eDate);
	    }
    });
}

function setTimeAvailable(begin, end) {
    // Set the datepickers, preserving previous selections if they do not fall
    // outside the bounds of begin` and `end` (datetimes).
    // These datetimes are inclusive.

    //TODO: only present times available in ncwms capabilities for this layer
    var yearRange = begin.getFullYear().toString(10) + ":" + end.getFullYear().toString(10);

    //preserve an active range previously set by a user to faciliate downloading matched data.
    var previousMinimum = $(".datepickerstart").datepicker("option", "minDate");
    var previousMaximum = $(".datepickerend").datepicker("option", "maxDate");
    var previousRangeFrom = $(".datepickerstart").datepicker("getDate");
    var previousRangeTo = $(".datepickerend").datepicker("getDate");

    // Set both datepicker min and max dates to `begin` and `end` respectively,
    // and limit year selector range to `begin` to `end` range.
    $.each([".datepickerstart", ".datepickerend"], function (idx, val) {
        $(val).datepicker("option", "minDate", begin);
        $(val).datepicker("option", "maxDate", end);
        $(val).datepicker("option", "yearRange", yearRange);
    });

    //try to keep the active range, if it was specified and is possible.
    //fall back to the beginning and end of the new dataset.

    // Set start datepicker value to previous start datepicker value, if it
    //  (a) exists,
    //  (b) is not the same as the previous minimum time (???)
    //  (c) is not before `begin`.
    // Otherwise set to `begin`.
    //
    // Question: Why are two datepickers set here? What does .datepicker
    // select??? (In Downscaled/BCCAQv2, there is no such datepicker.)
    // Question: What is the consequence of the preservation code above
    // only using .datepickerstart?
    if(previousMinimum
            && (previousMinimum.getTime() != previousRangeFrom.getTime())
            && (previousRangeFrom.getTime() >= begin.getTime() )) {
        $(".datepickerstart").datepicker("setDate", previousRangeFrom);
        $(".datepicker").datepicker("setDate", previousRangeFrom);  // ???
    } else {
        $(".datepickerstart").datepicker("setDate", begin);
        $(".datepicker").datepicker("setDate", begin);  // ???
    }

    // Set end datepicker value to previous end datepicker value, if it
    //  (a) exists,
    //  (b) is not the same as the previous maximum time (???)
    //  (c) is not after `end`.
    // Otherwise set to `end`.
    if(previousMaximum
            && (previousMaximum.getTime() != previousRangeTo.getTime())
            && (previousRangeTo.getTime() <= end.getTime() )) {
        $(".datepickerend").datepicker("setDate", previousRangeTo);
    } else {
        $(".datepickerend").datepicker("setDate", end);
    }

    //fire a change event to trigger the download link to update
   $("[class^='datepicker']").trigger("change");
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
        $.ajax({url: pdp.ncwms_url,
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
}

module.exports = {
    CfTime: CfTime
};