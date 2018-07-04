/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, d3, pdp, map, ncwms, DOMParser, handle_ie8_xml, getRasterNativeProj, ncwmsCapabilities, getRasterBbox, rasterBBoxToIndicies, intersection*/

"use strict";

function getPlotWindow() {
    var frag = document.createDocumentFragment(),
        div = frag.appendChild(pdp.createDiv('plot-window'));
    return div;
}

function createTimeseriesPlot(xdat, ydat) {
    var margin, width, height, x_scale, y_scale, datum, x_axis, y_axis,
        plot, line;

    margin = {top: 20, right: 20, bottom: 30, left: 50};
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    x_scale = d3.time.scale().range([0, width]);
    y_scale = d3.scale.linear().range([height, 0]);
    x_scale.domain(d3.extent(xdat));
    y_scale.domain(d3.extent(ydat));
    datum = ydat.map(function (i, d) { return { x: xdat[i], y: d }; });
    x_axis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom");
    y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("left");

    $('#plot-window').empty();
    plot = d3.select("#plot-window")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    line = d3.svg.line().
        x(function (d) { return x_scale(d.x); }).
        y(function (d) { return y_scale(d.y); });

    plot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis);

    plot.append("g")
        .attr("class", "y axis")
        .call(y_axis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Values");

    plot.append("path")
        .datum(datum)
        .attr("class", "line")
        .attr("d", line).
        attr("fill", "none").
        attr("stroke", "#4040A0");
}

function getOLClickHandler(map) {
    var AJAXGetIndices = function (x, y, callback) {
        var is_yearly, params;

        is_yearly = ncwms.params.LAYERS.match(/_yr_/);

        function responder(data, status, response) {
            var xmldoc, parser, ydat, xdat;
            if (response.responseXML) {
                xmldoc = response.responseXML;
            } else {
                parser = new DOMParser();
                xmldoc = parser.parseFromString(response.responseText, 'text/xml');
            }
            ydat = $(xmldoc).find("value").map(function (idx, elem) {
                return parseFloat($(elem).text());
            });

            xdat = $(xmldoc).find("time").map(function (idx, elem) {
                return new Date($(elem).text());
            });
            callback(xdat, ydat);
        }

        params = {
            REQUEST: "GetFeatureInfo",
            BBOX: map.getExtent().toBBOX(),
            SERVICE: "WMS",
            VERSION: "1.1.1",
            X: x,
            Y: y,
            QUERY_LAYERS: ncwms.params.LAYERS,
            LAYERS: ncwms.params.LAYERS,
            WIDTH: map.size.w,
            HEIGHT: map.size.h,
            SRS: map.getProjectionObject().projCode,
            INFO_FORMAT: "text/xml",
            // FIXME: This will need to change depending on whether annual or not.
        };

        // FIXME: Test that this works for annual Gregorian
        if (is_yearly) {
            $.extend(params, { TIME: "1950-07-02T00:00:00.000Z/2100-07-02T00:00:00.000Z" });
        } else {
            $.extend(params, { TIME: "1950-01-16T00:00:00.000Z/2100-12-16T00:00:00.000Z" });
        }

        $("#plot-window").dialog({
            appendTo: "#main",
            autoOpen: true,
            title: "plotwin",
            width: 1000,
            modal: true,
            position: { my: 'top', at: 'top', of: $('#pdp-map') },
            dialogClass: "no-title",
            buttons: {
                "Close": function () { $(this).dialog("close"); }
            }
        });
        $('#plot-window').empty();
        $('#plot-window').html("<h2>Please wait... data loading.</h2>");

        $.ajax({url: pdp.ncwms_url[0],
                data: params})
            .fail(handle_ie8_xml)
            .always(responder);
        //.fail(function(){alert("Something has gone wrong with the download");});
    };

    return function (e) {
        AJAXGetIndices(e.xy.x, e.xy.y, createTimeseriesPlot);
    };
}
