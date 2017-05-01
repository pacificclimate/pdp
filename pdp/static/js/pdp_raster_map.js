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
	if (index === undefined) {
		return this.sDate;
	}
	var d = new Date(this.sDate.getTime());	
	if(this.units == "days") {
		if((this.calendar == "standard") || (this.calendar == "gregorian")) {
			d.setDate(this.sDate.getDate() + index);
			return d;
		}
		else if(this.constantDaysPerYear) {
			d.setFullYear(this.sDate.getFullYear() + Math.floor(index / this.constantDaysPerYear));
			var msPerDay = 1000*60*60*24;
			var daysAlready = (d.getTime() - new Date(d.getFullYear(), 0, 1).getTime() ) / msPerDay;
			var dayRemainder = (index % this.constantDaysPerYear) + daysAlready;
			if(dayRemainder >= this.constantDaysPerYear) {
				d.setFullYear(d.getFullYear() + 1);
				dayRemainder = dayRemainder - this.constantDaysPerYear;
			}
			dayRemainder += Math.floor((dayRemainder / this.constantDaysPerYear) * (365.242 - this.constantDaysPerYear));
			d.setTime(d.getTime() + dayRemainder);
			return d;
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
    	if((this.calendar == "standard") || (this.calendar =="gregorian")) {
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
    return parseInt(match, 10);
}

function dasToUnitsSince(data) {
    var s = data.match(/time \{[\s\S]*?\}/gm)[0],
        reg = /units \"((year|month|day|hour|minute|second)s?) since (\d{4}-\d{1,2}-\d{1,2} ?[\d:]*)\"/g,
        m = reg.exec(s),
        units = m[1],
        dateString = m[3],
        sDate;   
    
    var calendar;
    reg = /calendar \"(standard|gregorian|365_day|noleap|360_day)\"/,
    m = reg.exec(s),
    calendar = m[1];
        
    reg = /(\d{4})-(\d{1,2})-(\d{1,2})( |T)(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
    m = reg.exec(dateString);
    if (m) {
        sDate = new Date(m[1], parseInt(m[2], 10) - 1, // Months in das result are 1-12, js needs 0-11
                         m[3], m[5], m[6], m[7], 0);
        return [units, sDate, calendar];
    }
    // Not ISO Format, maybe YYYY-MM-DD?
    reg = /(\d{4})-(\d{1,2})-(\d{1,2})/g;
    m = reg.exec(dateString);
    if (m) {
        return [units, new Date(m[1], parseInt(m[2], 10) - 1, m[3]), calendar];
    }
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
    var reg = /.*\/data\/(.*?)\/.*/g;
    var m = reg.exec(layerUrl);
    layerUrl = layerUrl.replace("data/" + m[1], m[1] + "/catalog")
    
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
        unitsSince = dasToUnitsSince(unitsSince[0]);
        units = unitsSince[0];
        startDate = unitsSince[1];
        calendar = unitsSince[2];
        layerTime = new CfTime(units, startDate, calendar);
        layerTime.setMaxTimeByIndex(maxTimeIndex);
        ncwms_layer.times = layerTime; // Future access through ncwmslayer?
        setTimeAvailable(layerTime.sDate, layerTime.eDate);
    });
}

function setTimeAvailable(begin, end) {
    //TODO: only present times available in ncwms capabilities for this layer
    var yearRange = begin.getFullYear().toString(10) + ":" + end.getFullYear().toString(10);
        
    //preserve an active range previously set by a user to faciliate downloading matched data.
    var previousMinimum = $(".datepickerstart").datepicker("option", "minDate");
    var previousMaximum = $(".datepickerend").datepicker("option", "maxDate");
    var previousRangeFrom = $(".datepickerstart").datepicker("getDate");
    var previousRangeTo = $(".datepickerend").datepicker("getDate");
    
    //set new maximums and minimums
    $.each([".datepickerstart", ".datepickerend"], function (idx, val) {
        $(val).datepicker("option", "minDate", begin);
        $(val).datepicker("option", "maxDate", end);
        $(val).datepicker("option", "yearRange", yearRange);
    });
    
    //try to keep the active range, if it was specified and is possible.
    //fall back to the beginning and end of the new dataset.
    if(previousMinimum 
    		&& (previousMinimum.getTime() != previousRangeFrom.getTime()) 
    		&& (previousRangeFrom.getTime() >= begin.getTime() )) {
    	$(".datepickerstart").datepicker("setDate", previousRangeFrom);
    	$(".datepicker").datepicker("setDate", previousRangeFrom);     	
    } else {
    	$(".datepickerstart").datepicker("setDate", begin);
        $(".datepicker").datepicker("setDate", begin);
    }
    
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
}
