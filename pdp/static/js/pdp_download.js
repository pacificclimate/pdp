function createFormatOptions() {
    var formatData = {nc: mkOpt('NetCDF', 'NetCDF is a self-describing file format widely used in the atmospheric sciences. Self describing means that the format information is contained within the file itself, so generic tools can be used to import these data. The format requires use of freely available applications to view, import, and export the data.'),
		      csv: mkOpt('CSV', 'CSV stands for Comma Separated Values. This format is a human readable list of data typically with a time stamp, observational value, and flags with one line per observation time. Each observation is separated by commas.'),
		      ascii: mkOpt('ASCII', 'ASCII data are also in a text format with a identical data organization as the CSV data.'),
		      xls: mkOpt('MS Excel', 'This data format is compatible with many popular spreadsheet programs such as Open Office, Libre Office and Microsoft Excel. Data organization is similar to CSV, but the format is more directly readable with spreadsheet software.') };

    return getSelectorWithHelp('Output Format', 'data-format', 'data-format', 'data-format-selector', 'csv', formatData,'View output format descriptions', 450, 450);
}

function createRasterFormatOptions() {
    var formatData = {nc: mkOpt('NetCDF', 'NetCDF is a self-describing file format widely used in the atmospheric sciences. Self describing means that the format information is contained within the file itself, so generic tools can be used to import these data. The format requires use of freely available applications to view, import, and export the data.'),
		      csv: mkOpt('CSV', 'CSV stands for Comma Separated Values. This format is a human readable list of data typically with a time stamp, observational value, and flags with one line per observation time. Each observation is separated by commas.'),
		      ascii: mkOpt('ASCII', 'ASCII data are also in a text format with a identical data organization as the CSV data.') };

    return getSelectorWithHelp('Output Format', 'data-format', 'data-format', 'data-format-selector', 'nc', formatData,'View output format descriptions', 450, 450);
}

function createMetadataFormatOptions() {
    var mdFormatData = { WFS: mkOptGroup({ csv: mkOpt('CSV'), GML2: mkOpt('GML2'), 'GML2-GZIP': mkOpt('GML2-GZIP'), 'text/xml; subtype=gml/3.1.1': mkOpt('GML3.1'), 'text/xml; subtype=gml/3.2': mkOpt('GML3.2'), 'json': mkOpt('GeoJSON'), 'SHAPE-ZIP': mkOpt('Shapefile') }),
			 WMS: mkOptGroup({ 'application/atom+xml': mkOpt('AtomPub'), 'image/gif': mkOpt('GIF'), 'application/rss+xml': mkOpt('GeoRSS'), 'image/geotiff': mkOpt('GeoTiff'), 'image/geotiff8': mkOpt('GeoTiff 8bit'), 'image/jpeg': mkOpt('JPEG'), 'application/vnd.google-earth.kmz+xml': mkOpt('KML (compressed)'), 'application/vnd.google-earth.kml+xml': mkOpt('KML (plain)'), 'application/openlayers': mkOpt('OpenLayers'), 'application/pdf': mkOpt('PDF'), 'image/png': mkOpt('PNG'), 'image/png8': mkOpt('PNG 8bit'), 'image/svg+xml': mkOpt('SVG'), 'image/tiff': mkOpt('Tiff'), 'image/tiff8': 'Tiff 8bit' })
		       };
    
    return getSelector('Output Format', 'metadata-format', "metadata-format", undefined, undefined, mdFormatData);
}

function createDownloadButtons(id, divClass, buttons) {
    var downloadDiv = createDiv(id);
    downloadDiv.className = divClass;
    $.each(buttons, function(idx, val) {
	   downloadDiv.appendChild(createInputElement("button", undefined, idx, idx, val))
	   downloadDiv.appendChild(document.createTextNode(" "));
    });
    return downloadDiv;
}