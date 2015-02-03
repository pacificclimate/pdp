/*global pdp, document, $
*/
/*debug true*/

"use strict";

function createFormatOptions() {
    var formatData = {nc: pdp.mkOpt('NetCDF', 'NetCDF is a self-describing file format widely used in the atmospheric sciences. Self describing means that the format information is contained within the file itself, so generic tools can be used to import these data. The format requires use of freely available applications to view, import, and export the data.'),
                      ascii: pdp.mkOpt('CSV/ASCII', 'CSV/ASCII response will return an OPeNDAP plain-text response which is a human readable array notation. For weather station data, the format normally consists of a sequence of fields separated by a comma and a space (e.g. " ,")'),
                      xlsx: pdp.mkOpt('MS Excel 2010', 'This data format is compatible with many popular spreadsheet programs such as Open Office, Libre Office and Microsoft Excel 2010. Data organization is similar to CSV, but the format is more directly readable with spreadsheet software.') };

    return pdp.getSelectorWithHelp('Output Format', 'data-format', 'data-format', 'data-format-selector', 'csv', formatData, 'View output format descriptions', 450, 450);
}

function createRasterFormatOptions() {
    var formatData = {nc: pdp.mkOpt('NetCDF', 'NetCDF is a self-describing file format widely used in the atmospheric sciences. Self describing means that the format information is contained within the file itself, so generic tools can be used to import these data. The format requires use of freely available applications to view, import, and export the data.'),
                      ascii: pdp.mkOpt('ASCII', 'ASCII response will return an OPeNDAP plain-text response which is a human readable array notation.'),
                      aig: pdp.mkOpt('Arc/Info ASCII Grid', 'This format is the ASCII interchange format for Arc/Info Grid. It takes the form of one ASCII file per layer, plus sometimes an associated .prj file, all of which are wrapped up in zip archive.') };

    return pdp.getSelectorWithHelp('Output Format', 'data-format', 'data-format', 'data-format-selector', 'nc', formatData, 'View output format descriptions', 450, 450);
}

function createMetadataFormatOptions() {
    var mdFormatData = { WFS: pdp.mkOptGroup({ csv: pdp.mkOpt('CSV'), GML2: pdp.mkOpt('GML2'), 'GML2-GZIP': pdp.mkOpt('GML2-GZIP'), 'text/xml; subtype=gml/3.1.1': pdp.mkOpt('GML3.1'), 'text/xml; subtype=gml/3.2': pdp.mkOpt('GML3.2'), 'json': pdp.mkOpt('GeoJSON'), 'SHAPE-ZIP': pdp.mkOpt('Shapefile') }),
                         WMS: pdp.mkOptGroup({ 'application/atom+xml': pdp.mkOpt('AtomPub'), 'image/gif': pdp.mkOpt('GIF'), 'application/rss+xml': pdp.mkOpt('GeoRSS'), 'image/geotiff': pdp.mkOpt('GeoTiff'), 'image/geotiff8': pdp.mkOpt('GeoTiff 8bit'), 'image/jpeg': pdp.mkOpt('JPEG'), 'application/vnd.google-earth.kmz+xml': pdp.mkOpt('KML (compressed)'), 'application/vnd.google-earth.kml+xml': pdp.mkOpt('KML (plain)'), 'application/openlayers': pdp.mkOpt('OpenLayers'), 'application/pdf': pdp.mkOpt('PDF'), 'image/png': pdp.mkOpt('PNG'), 'image/png8': pdp.mkOpt('PNG 8bit'), 'image/svg+xml': pdp.mkOpt('SVG'), 'image/tiff': pdp.mkOpt('Tiff'), 'image/tiff8': 'Tiff 8bit' })
                       };

    return pdp.getSelector('Output Format', 'metadata-format', "metadata-format", undefined, undefined, mdFormatData);
}

function createDownloadButtons(id, divClass, buttons) {
    var downloadDiv = pdp.createDiv(id);
    downloadDiv.className = divClass;
    $.each(buttons, function (idx, val) {
        downloadDiv.appendChild(pdp.createInputElement("button", undefined, idx, idx, val));
        downloadDiv.appendChild(document.createTextNode(" "));
    });
    return downloadDiv;
}

function createDownloadLink(id, divClass, links) {
    var downloadDiv = pdp.createDiv(id);
    downloadDiv.className = divClass;
    $.each(links, function(idx, val) {
	downloadDiv.appendChild(pdp.createLink(idx, "", "", val, "name"));
    });
    return downloadDiv;
};

function getCatalog(callback) {
    $.ajax({'url': '../catalog/' + 'catalog.json',
        'type': 'GET',
        'dataType': 'json',
        'success': function (data, textStatus, jqXHR) {
            callback(data);
        }
        }
        );
}
