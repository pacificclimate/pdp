/*jslint browser: true, devel: true */
/*global pdp, $, OpenLayers, setTimeAvailable, handle_ie8_xml, DOMParser, calendars
*/
"use strict";

function getNcwmsLayerId(ncwms_layer) {
    return ncwms_layer.params.LAYERS.split("/")[0];
}

function ddsToTimeIndex(dds) {
    var reg, match;
    reg = /\[time = (\d+)\]/g;
    match = reg.exec(dds)[1];
    return parseInt(match, 10);
}

function dasToCfTimeSystem(das, indexCount) {
    var timeDimensionRegex = /time \{[\s\S]*?\}/gm;
    var timeDimensionDescr = das.match(timeDimensionRegex)[0];

    var unitsSinceRegex = /units \"((year|month|day|hour|minute|second)s?) since (\d{4}-\d{1,2}-\d{1,2}[ T]?[\d:]*)\"/g;
    var unitsSinceMatch = unitsSinceRegex.exec(timeDimensionDescr);
    var units = unitsSinceMatch[1];
    var startDateString = unitsSinceMatch[3];

    var calendarRegex = /calendar \"(standard|gregorian|proleptic_gregorian|365_day|noleap|360_day)\"/;
    var calendarMatch = calendarRegex.exec(timeDimensionDescr);
    var calendarType = calendarMatch ? calendarMatch[1] : 'standard';

    var calendar = calendars[calendarType];
    var simpleDatetime = calendars.SimpleDatetime.fromIso8601(startDateString);
    var startDate = new calendars.CalendarDatetime(calendar, simpleDatetime);

    return new calendars.CfTimeSystem(units, startDate, indexCount);
}

function processNcwmsLayerMetadata(ncwms_layer, catalog) {
    // transform the data_server url into the un-authed catalog based url for metadata
    var layerUrl = catalog[getNcwmsLayerId(ncwms_layer)]; //matches[1] is portal base url, matches[2] is dataset, make catalog url // Request time variables
    var maxTimeReq = dataServices.getNcwmsLayerDDS(layerUrl);
    var unitsSinceReq = dataServices.getNcwmsLayerDAS(layerUrl);

    // Process times when both returned
    $.when(maxTimeReq, unitsSinceReq).done(function (maxTime, unitsSince) {
        var indexCount = ddsToTimeIndex(maxTime[0]);
        var cfTimeSystem = dasToCfTimeSystem(unitsSince[0], indexCount);
        ncwms_layer.cfTimeSystem = cfTimeSystem;

        // If page has datepicker(s), set them up.
        if ($(".datepickerstart").length > 0) {
            setTimeAvailable(cfTimeSystem);
	    }
    });
}

// TODO: This belongs in the `calendars` module
function transferDate(date, newSystem, fallbackDate) {
    // Transfer `date`, which is a `CfDatetime` object with an
    // associated `CfTimeSystem` to the (new) `cfTimeSystem`, if possible.
    //
    // Transfer is possible if `date`:
    //  (a) exists
    //  (b) contains a datetime (year, month, day, etc.) compatible
    //      with `cfTimeSystem`, meaning the datetime does not throw an
    //      error when a new `CfDatetime` is created using its values,
    //      which in turn means it is compatible with `cfTimeSystem.calendar`
    //      and does not exceed the index bounds of `cfTimeSystem`.
    //
    // Otherwise return `fallbackDate`.
    if (!date) {
        return fallbackDate;
    }
    if (_.isEqual(date.system, newSystem)) {
        // Same CfTimeSystem, therefore compatible, no need to create new
        // CfDatetime.
        return date;
    }
    try {
        var dt = date.toCalendarDatetime().datetime;
        var result = new calendars.CfDatetime.fromDatetime(
            newSystem, dt.year, dt.month, dt.day
        );
        return result;
    } catch(error) {
        return fallbackDate;
    }
}

function setTimeAvailable(cfTimeSystem) {
    // We associate, using jQuery's `.data()` method, a date value
    // to the start and end datepicker elements. This value encodes the meaning
    // of the date entered in each element as a `CfDatetime`, which carries
    // all information about the CF time system (units, start date,
    // calendar, index count) as well as the value of the date proper.
    //
    // We attempt to transfer the existing dates to the next time system,
    // using the function `transferDate`.

    var $startDate = $("#from-date");
    var $endDate = $("#to-date");

    var prevStartDate = $startDate.data('cfDate');
    var prevEndDate = $endDate.data('cfDate');

    var startDate = transferDate(prevStartDate, cfTimeSystem, cfTimeSystem.firstCfDatetime());
    setDatepicker($startDate, startDate);

    var endDate = transferDate(prevEndDate, cfTimeSystem, cfTimeSystem.lastCfDatetime());
    setDatepicker($endDate, endDate);

    setCfTimeSystemMessages($('#date-range-messages'), cfTimeSystem);

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
    const bboxes = capabilities.find(
      'Capability > Layer > Layer > Layer > BoundingBox'
    );
    // Since the dataset <Name> is now the filepath, which does not necessarily
    // match `layer_name`, we can't find it that way. Instead we make the
    // somewhat fragile but currently valid assumption that the first (and
    // only) such layer is the one we want.
    const bbox = bboxes[0];
    console.log('### getRasterNativeProj', {bboxes})
    const srs = bbox.attributes.getNamedItem('SRS');
    // For reasons beyond mortal ken, ncWMS now returns CRS:84 instead of
    // EPSG:4326 for many of our datasets. CRS:84 is not recognized by proj4js.
    const value = srs.value === "CRS:84" ? "EPSG:4326" : srs.value;
    return new OpenLayers.Projection(value);
}

function getRasterBbox(capabilities, layer_name) {
    // The WMS layer doesn't seem to have the bbox of the _data_ available, which I would like to have
    // Pull the geographic bounding box out of the appropriate element
    const real_bounds = new OpenLayers.Bounds();
    const bboxes = capabilities.find(
      'Capability > Layer > Layer > Layer > LatLonBoundingBox'
    );
    // Since the dataset <Name> is now the filepath, which does not necessarily
    // match `layer_name`, we can't find it that way. Instead we make the
    // possibly fragile but currently valid assumption that every layer listed
    // has the same spatial extent, and so we can always use the first one.
    const bbox = bboxes[0];
    real_bounds.extend(
      new OpenLayers.LonLat(
        parseFloat(bbox.attributes.getNamedItem('minx').value),
        parseFloat(bbox.attributes.getNamedItem('miny').value)
      )
    );
    real_bounds.extend(
      new OpenLayers.LonLat(
        parseFloat(bbox.attributes.getNamedItem('maxx').value),
        parseFloat(bbox.attributes.getNamedItem('maxy').value)
      )
    );
    return real_bounds;
}

function rasterBboxToIndices(map, layer, catalog, bounds, callback) {
    // Compute raster indices in a map layer `layer` of a bounding box `bounds`.
    // The indices are returned as an `OpenLayer.Bounds` object. (Which is a
    // little odd, since such objects are supposed to contain map coordinate
    // values. Oh well.)
    // The layer catalog `catalog` is required to determine the URL for data
    // needed for the computation.
    // Since this function makes an asynchronous request for data, the
    // result is communicated via a callback function.
    const nearestIndex = utils.nearestIndex;

    dataServices.getLatLonValues(layer, catalog).done(function(dimensions) {
        const left = nearestIndex(dimensions.lon, bounds.left);
        const right = nearestIndex(dimensions.lon, bounds.right);
        const top = nearestIndex(dimensions.lat, bounds.top);
        const bottom = nearestIndex(dimensions.lat, bounds.bottom);
        const indices = new OpenLayers.Bounds(left, bottom, right, top);
        callback(indices);
    });
}

condExport(module,  {
    getNcwmsLayerId: getNcwmsLayerId,
    ddsToTimeIndex: ddsToTimeIndex,
    dasToCfTimeSystem: dasToCfTimeSystem,
    processNcwmsLayerMetadata: processNcwmsLayerMetadata,
    transferDate: transferDate,
    setTimeAvailable: setTimeAvailable,
    intersection: intersection,
    getRasterNativeProj: getRasterNativeProj,
    getRasterBbox: getRasterBbox,
    rasterBboxToIndices: rasterBboxToIndices
});
