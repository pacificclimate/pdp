/*jslint browser: true, devel: true */
/*global $, jQuery, pdp, map, gs_url, OpenLayers, BC3005_map_options, getBasicControls, getPolygonLayer, getEditingToolbar, getPolyEditor, getHandNav, getGSBaseLayer, getLoadingPopup, generateGetFeatureInfoParams, filter_undefined*/
"use strict";

// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var map, selectionLayer;

function init_crmp_map() {
    var options, mapControls, panelControls, crmp,
        mapButtonsDiv, mdFieldset, mdDialogDiv, stnListDiv,
        popup, crmpHashNames;

    // Map Config
    options = BC3005_map_options();
    options.tileManager = null;

    // Map Controls
    mapControls = getBasicControls();
    selectionLayer = getPolygonLayer();
    panelControls = getEditingToolbar([getHandNav(), getPolyEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;

    map = new OpenLayers.Map('pdp-map', options);

    crmp = new OpenLayers.Layer.WMS(
        "PCDS stations",
        pdp.gs_url + "CRMP/wms",
        {
            layers: 'CRMP:crmp_network_geoserver',
            transparent: 'true'
        },
        {
            maxExtent: new OpenLayers.Bounds(-236114, 41654.75, 2204236, 1947346.25),
            transitionEffect: null
        }
    );

    function getMdDownloadFormatSelector() {
        var div, fmtOptionData;
        fmtOptionData = {
            '': pdp.mkOpt('Select one'),
            'WFS': pdp.mkOptGroup({
                'csv': pdp.mkOpt('CSV'),
                'GML2': pdp.mkOpt('GML2'),
                'GML2-GZIP': pdp.mkOpt('GML2-GZIP'),
                'text/xml; subtype=gml/3.1.1': pdp.mkOpt('GML3.1'),
                'text/xml; subtype=gml/3.2': pdp.mkOpt('GML3.2'),
                'json': pdp.mkOpt('GeoJSON'),
                'SHAPE-ZIP': pdp.mkOpt('Shapefile')
            }),
            'WMS': pdp.mkOptGroup({
                'application/atom+xml': pdp.mkOpt('AtomPub'),
                'image/gif': pdp.mkOpt('GIF'),
                'application/rss+xml': pdp.mkOpt('GeoRSS'),
                'image/geotiff': pdp.mkOpt('GeoTiff'),
                'image/geotiff8': pdp.mkOpt('GeoTiff 8-bits'),
                'image/jpeg': pdp.mkOpt('JPEG'),
                'application/vnd.google-earth.kmz+xml': pdp.mkOpt('KML (compressed)'),
                'application/vnd.google-earth.kml+xml': pdp.mkOpt('KML (plain)'),
                'application/openlayers': pdp.mkOpt('OpenLayers'),
                'application/pdf': pdp.mkOpt('PDF'),
                'image/png': pdp.mkOpt('PNG'),
                'image/png8': pdp.mkOpt('PNG 8bit'),
                'image/svg+xml': pdp.mkOpt('SVG'),
                'image/tiff': pdp.mkOpt('Tiff'),
                'image/tiff8': pdp.mkOpt('Tiff 8-bits')
            })
        };
        div = pdp.getSelector('Output Format:', 'metadata-format', 'metadata-format', 'metadata-format', '', fmtOptionData);
        div.style.width = '200px';
        return div;
    }

    function getMdDownloadFieldset() {
        var form, fs, downloadDiv;
        form = pdp.createForm(undefined, undefined, 'post', undefined);

        fs = pdp.createFieldset("md-fieldset", "Metadata Download");
        downloadDiv = pdp.createDiv("md-download-button");
        downloadDiv.appendChild(pdp.createInputElement('button', undefined, undefined, undefined, "Download"));

        fs.appendChild(getMdDownloadFormatSelector());
        fs.appendChild(downloadDiv);

        form.appendChild(fs);
        return form;
    }

    mapButtonsDiv = pdp.createDiv("map-buttons");
    mapButtonsDiv.appendChild(pdp.createInputElement("button", undefined, "legend-button", "legend-button", "View Legend"));
    mapButtonsDiv.appendChild(pdp.createInputElement("button", undefined, "metadata-button", "metadata-button", "View Metadata"));
    map.div.appendChild(mapButtonsDiv);

    mdDialogDiv = pdp.createDiv("metadata-dialog");
    // var mdDownloadDiv = pdp.createDiv("md-download");
    mdFieldset = getMdDownloadFieldset();
    // mdDownloadDiv.appendChild(mdFieldset);
    stnListDiv = pdp.createDiv("station-list");
    mdDialogDiv.appendChild(mdFieldset);
    mdDialogDiv.appendChild(stnListDiv);
    map.div.appendChild(mdDialogDiv);
    pdp.createDialog(mdDialogDiv, "Station Metadata", 1000, 600);
    $(mdDialogDiv).dialog({
        beforeClose: function (event, ui) {
            $('#station-list').html('');
        }
    });

    map.addLayers(
        [crmp,
             selectionLayer,
             getGSBaseLayer(pdp.gs_url, "OpenStreetMap brown green", "osm_pnwa_green_brown_gwc"),
             getGSBaseLayer(pdp.gs_url, "OpenStreetMap greens", "osm_pnwa_mapquest_gwc"),
             getGSBaseLayer(pdp.gs_url, "OpenStreetMap whites", "osm_pnwa_whites_gwc")
             ]
    );
    map.zoomToMaxExtent();

    // Additional Functionality
    function crmpgetfeatureinfo(e, fCount, buff, funcToCall) {
        var wmsurl, stns_lyr, lonLat, myX, myY;

        wmsurl = pdp.gs_url + "CRMP/wms?";
        stns_lyr = map.getLayersByName('PCDS stations')[0];
        lonLat = map.getLonLatFromPixel(e.xy);
        myX = e.xy.x.toFixed(0);
        myY = e.xy.y.toFixed(0);

        function fillPopup(response) {
            var tempPopup;

            if (popup) { map.removePopup(popup); }
            tempPopup = getLoadingPopup("temp", lonLat);
            map.addPopup(tempPopup, true);
            if ($('<div/>').append(response.responseText).find('table').length > 0) {
                popup = new OpenLayers.Popup.Anchored(
                    "chicken",
                    lonLat,
                    new OpenLayers.Size(200, 200),
                    response.responseText,
                    null,
                    true,
                    null
                );
                popup.autoSize = true;
                popup.keepInMap = true;
                popup.panMapIfOutOfView = (map.getZoom() !== 0);
                map.removePopup(tempPopup);
                map.addPopup(popup, true);
            } else {
                map.removePopup(tempPopup);
            }
        }
        // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)

        OpenLayers.Request.GET({
            url: wmsurl,
            params: generateGetFeatureInfoParams(map, myX, myY, stns_lyr, fCount, buff),
            success: fillPopup
        });
        // OpenLayers.loadURL(wmsurl, params, this, function (response){
        // funcToCall(response, lonLat);
        // });
    }

    function callPopup(e) {
        crmpgetfeatureinfo(e, 5, 10);
    }

    map.events.register('click', map, callPopup);

    function fixAttrDataFields(colName, value) {
        if (value === null) {
            return '';
        }
        switch (colName) {
        case 'lat':
        case 'lon':
            return (value.toFixed(4));
        case 'max_obs_time':
        case 'min_obs_time':
            return (value.replace(/\s/g, ''));
        default:
            return value;
        }
    }

    function fillMetadata() {
        var filters, formatter, xml, url, params;

        filters = map.composite_filter;
        formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: 'WFS' === 'WMS'});
        xml = new OpenLayers.Format.XML();

        url = '/geoserver/CRMP/ows?service=WFS';
        params = {
            'version': '1.1.0',
            'request': 'GetFeature',
            'typeName': 'CRMP:crmp_network_geoserver',
            'outputFormat': 'json',
            'srsname': 'epsg:4326'
        };

        if (!filter_undefined(filters)) {
            params.filter = xml.write(formatter.write(filters));
        }
        url = url + '&' + $.param(params);
        $.getJSON(url, function (data) {
            var stationCount, tbl_body;

            stationCount = (data.features.length) + " stations selected.\n";
            tbl_body = '<table class="metafeatureInfo" border="0"><thead><tr>';

            // add the header row first
            if (data.features.length !== 0) {
                $.each(crmpHashNames, function (k, v) {
                    tbl_body += '<th align="left" class="attribute">' + v + '</th>';
                });
                tbl_body += '</tr></thead><tbody>';

                // then loop through the data & add the data rows
                $.each(data.features, function (i, feat) {
                    var tbl_row = '';
                    $.each(crmpHashNames, function (k, v) {
                        tbl_row += "<td>" + fixAttrDataFields(k, feat.properties[k]) + "</td>";
                    });
                    tbl_body += "<tr>" + tbl_row + "</tr>";
                });
                $("#station-list").html(stationCount + tbl_body + "</tbody></table>");
            } else {
                $("#station-list").html("No data selected.");
            }
        });
    }

    $('#metadata-button').click(function (e) {
        $('#metadata-dialog').dialog("open");
        $('#station-list').html('<p>Loading... <br/><img style="padding-top: 4px; width: 30px; height: 30px;" src="' + pdp.app_root + '/images/anim_loading.gif"/></p>');
        fillMetadata();
    });

    crmpHashNames = {'network_name' : 'Network Name',
                     'native_id'    : 'Native ID',
                     'station_name' : 'Station Name',
                     'lon'          : 'Longitude',
                     'lat'          : 'Latitidue',
                     'elev'         : 'Elev (m)',
                     'min_obs_time' : 'Record Start',
                     'max_obs_time' : 'Record End',
                     'freq'         : 'Frequency'
                    };

    return map;
}
