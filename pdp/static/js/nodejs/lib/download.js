// pdp download library

/*jshint browser: true, unused: true */
/* global $ */

"use strict";

var dom = require("./dom.js");

var createFormatOptions = function () {
    var formatData = {nc: dom.mkOpt("NetCDF", "NetCDF is a self-describing file format widely used in the atmospheric sciences. Self describing means that the format information is contained within the file itself, so generic tools can be used to import these data. The format requires use of freely available applications to view, import, and export the data."),
		      ascii: dom.mkOpt("CSV/ASCII", "CSV/ASCII response will return an OPeNDAP plain-text response which is a human readable array notation. For weather station data, the format normally consists of a sequence of fields separated by a comma and a space (e.g. \" ,\")"),
		      xlsx: dom.mkOpt("MS Excel 2010", "This data format is compatible with many popular spreadsheet programs such as Open Office, Libre Office and Microsoft Excel 2010. Data organization is similar to CSV, but the format is more directly readable with spreadsheet software.") };

    return dom.getSelectorWithHelp("Output Format", "data-format", "data-format", "data-format-selector", "csv", formatData,"View output format descriptions", 450, 450);
};
exports.createFormatOptions = createFormatOptions;

var createRasterFormatOptions = function () {
    var formatData = {nc: dom.mkOpt("NetCDF", "NetCDF is a self-describing file format widely used in the atmospheric sciences. Self describing means that the format information is contained within the file itself, so generic tools can be used to import these data. The format requires use of freely available applications to view, import, and export the data."),
		      ascii: dom.mkOpt("ASCII", "ASCII response will return an OPeNDAP plain-text response which is a human readable array notation."),
		      aig: dom.mkOpt("Arc/Info ASCII Grid", "This format is the ASCII interchange format for Arc/Info Grid. It takes the form of one ASCII file per layer, plus sometimes an associated .prj file, all of which are wrapped up in zip archive.") };

    return dom.getSelectorWithHelp("Output Format", "data-format", "data-format", "data-format-selector", "nc", formatData,"View output format descriptions", 450, 450);
};
exports.createRasterFormatOptions = createRasterFormatOptions;

var createMetadataFormatOptions  = function () {
    var mdFormatData = { WFS: dom.mkOptGroup({ csv: dom.mkOpt("CSV"), GML2: dom.mkOpt("GML2"), "GML2-GZIP": dom.mkOpt("GML2-GZIP"), "text/xml; subtype=gml/3.1.1": dom.mkOpt("GML3.1"), "text/xml; subtype=gml/3.2": dom.mkOpt("GML3.2"), "json": dom.mkOpt("GeoJSON"), "SHAPE-ZIP": dom.mkOpt("Shapefile") }),
			 WMS: dom.mkOptGroup({ "application/atom+xml": dom.mkOpt("AtomPub"), "image/gif": dom.mkOpt("GIF"), "application/rss+xml": dom.mkOpt("GeoRSS"), "image/geotiff": dom.mkOpt("GeoTiff"), "image/geotiff8": dom.mkOpt("GeoTiff 8bit"), "image/jpeg": dom.mkOpt("JPEG"), "application/vnd.google-earth.kmz+xml": dom.mkOpt("KML (compressed)"), "application/vnd.google-earth.kml+xml": dom.mkOpt("KML (plain)"), "application/openlayers": dom.mkOpt("OpenLayers"), "application/pdf": dom.mkOpt("PDF"), "image/png": dom.mkOpt("PNG"), "image/png8": dom.mkOpt("PNG 8bit"), "image/svg+xml": dom.mkOpt("SVG"), "image/tiff": dom.mkOpt("Tiff"), "image/tiff8": "Tiff 8bit" })
		       };
    
    return dom.getSelector("Output Format", "metadata-format", "metadata-format", undefined, undefined, mdFormatData);
};
exports.createMetadataFormatOptions = createMetadataFormatOptions;

var createDownloadButtons = function (id, divClass, buttons) {
    var downloadDiv = dom.createDiv(id);
    downloadDiv.className = divClass;
    $.each(buttons, function(idx, val) {
	   downloadDiv.appendChild(dom.createInputElement("button", undefined, idx, idx, val));
	   downloadDiv.appendChild(document.createTextNode(" "));
    });
    return downloadDiv;
};
exports.createDownloadButtons = createDownloadButtons;

var getCatalog = function(callback) {
    $.ajax({"url": "../catalog/" + "catalog.json",
        "type": "GET",
        "dataType": "json",
        "success": function(data, textStatus, jqXHR) {
            /*jshint unused: false */
            callback(data);
        }
    });
};
exports.getCatalog = getCatalog;
