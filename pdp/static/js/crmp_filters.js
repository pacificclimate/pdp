/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, pp_bignum, polygon_as_text*/
"use strict";

var last_record_length_req_time = Date();
var last_station_count_req_time = Date();

function net_filter(net_name) {
    return new OpenLayers.Filter.Comparison({
        type: "==",
        property: "network_name",
        value: net_name
    });
}

function date_filter(sdate, edate) {
    var d = new Date();
    if (edate === 'YYYY/MM/DD') {
        edate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); //today
    }
    if (sdate === 'YYYY/MM/DD') {
        sdate = '1870/01/01'; // ~beginning of our data (unless we find a magic data set)
    }
    // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
    return new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [
            new OpenLayers.Filter.Comparison({
                type: ">=",
                property: "max_obs_time",
                value: sdate
            }),
            new OpenLayers.Filter.Comparison({
                type: "<=",
                property: "min_obs_time",
                value: edate
            })
        ]
    });
}

function freq_filter(freq) {
    return new OpenLayers.Filter.Comparison({
        type: "==",
        property: "freq",
        value: freq
    });
}

function var_filter(stn_var) {
    return new OpenLayers.Filter.Comparison({
        type: "~",
        property: "vars",
        value: "*" + stn_var + "*"
    });
}

function has_climatology_filter() {
    return new OpenLayers.Filter.Comparison({
        type: "~",
        property: "vars",
        value: "%within%"
    });
}

function polygon_filter(map) {
    var filters, lyr,
        P4326 = new OpenLayers.Projection("EPSG:4326"),
        P3005 = new OpenLayers.Projection("EPSG:3005");
    function feat2filt(feat) {
        var my_copy = feat.geometry.clone();
        my_copy.transform(P3005, P4326); // This does a transform _in_place_
        return new OpenLayers.Filter.Spatial({
            type: "INTERSECTS",
            value: my_copy
        });
    }
    lyr = map.getLayersByName("Polygon selection")[0];
    filters = $.map(lyr.features, feat2filt);
    return new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.OR,
        filters: filters
    });
}

function update_station_count(box) {
    box.value = box.value.replace(/[0-9]+[GMk]? stations/g, '??? stations');
    var req_time = new Date(),
        last_station_count_req_time = new Date();

    function success(data, textStatus, jqXHR) {
        if (req_time < last_station_count_req_time) {
            return;
        }
        box.readonly = null;
        box.value = box.value.replace(/([0-9]+|[?]{3}) stations/g, data.stations_selected.toString() + ' stations');
        box.readonly = 'readonly';
    }

    // TODO: Replace callback with .done
    dataServices.getStationCount($('form').serialize(), success);
}

function update_record_length(box) {
    box.value = box.value.replace(/[0-9]+[GMk]? observations/g, '??? observations');
    box.value = box.value.replace(/[0-9]+[GMk]? climatologies/g, '??? climatologies');
    var req_time = new Date(),
        last_record_length_req_time = new Date();

    function success(data, textStatus, jqXHR) {
        if (req_time < last_record_length_req_time) { return; }
        box.readonly = null;
        box.value = box.value.replace(/([0-9]+[GMk]?|[?]{3}) observations/g, pp_bignum(data.record_length) + ' observations');
        box.value = box.value.replace(/([0-9]+[GMk]?|[?]{3}) climatologies/g, pp_bignum(data.climo_length) + ' climatologies');
        box.readonly = 'readonly';
    }

    // TODO: Replace callback with .done
    dataServices.getRecordLength($('form').serialize(), success);
}

function update_filter_layer(map) {
    var lyr, formatter, xml, filter;
    lyr = map.getLayersByName('PCDS stations')[0]; // FIXME: assumes that var map is global or in scope
    formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: true}); // For wMs (not wFs)
    xml = new OpenLayers.Format.XML();
    filter = map.composite_filter;
    lyr.params.filter = xml.write(formatter.write(filter));
    lyr.redraw();
}

function CRMPFilterChange(map) {
    $("#input-polygon").val(polygon_as_text());
    var composite_filter = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: map.filters.values()
    });
    map.composite_filter = composite_filter;
    update_filter_layer(map);
    update_station_count($("#infobox")[0]);
    update_record_length($("#infobox")[0]);
}

function filter_append(map, fil) {
    map.filters.push(fil);
    CRMPFilterChange();
}

function filter_clear(map) {
    var filtValsFunc = map.filters.values;
    map.filters = {};
    map.filters.values = filtValsFunc;
    map.getLayersByName("Polygon selection")[0].removeAllFeatures();
}

function filterChange(filter_func, filter_name, map, e) {
    var val = e.target.value;
    if (val) {
        map.filters[filter_name] = filter_func(val);
    } else {
        delete map.filters[filter_name];
    }
}
function netChange(map, e) { filterChange(net_filter, 'network', map, e); }

function freqChange(map, e) { filterChange(freq_filter, 'freq', map, e); }

function varChange(map, e) { filterChange(var_filter, 'stn_var', map, e); }

function dateChange(map, e) {
    // Handle a change of start and/or end date.
    var $startDate = $('#from-date');
    var $endDate = $('#to-date');
    processDateRangeInput($startDate, false, $('#from-date-error-message'))
    processDateRangeInput($endDate, true, $('#to-date-error-message'));
    map.filters.date = date_filter($startDate.val(), $endDate.val());
}

function polyChange(map) {
    var fil = polygon_filter(map);
    map.filters.polygon = fil;
    CRMPFilterChange(map);
    //    alert('Polygon completed');
}

function hasClimaChange(map, e) {
    var clima_checked = e.target.checked;
    if (clima_checked) {
        map.filters.has_clima = has_climatology_filter();
    } else {
        delete map.filters.has_clima;
    }
}

condExport(module, {
    net_filter: net_filter,
    date_filter: date_filter,
    freq_filter: freq_filter,
    var_filter: var_filter,
    has_climatology_filter: has_climatology_filter,
    polygon_filter: polygon_filter,
    update_station_count: update_station_count,
    update_record_length: update_record_length ,
    update_filter_layer: update_filter_layer,
    CRMPFilterChange: CRMPFilterChange,
    filter_append: filter_append,
    filter_clear: filter_clear,
    filterChange: filterChange,
    netChange: netChange,
    freqChange: freqChange,
    varChange: varChange,
    dateChange: dateChange,
    polyChange: polyChange,
    hasClimaChange: hasClimaChange,
});