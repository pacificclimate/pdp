//var map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var map;
var selectionLayer;

function init_crmp_map() {
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
    
    var crmp = new OpenLayers.Layer.WMS(
        "PCDS stations", pdp.gs_url + "CRMP/wms",
        {
            layers: 'CRMP:crmp_network_geoserver',
            transparent: 'true'
        },
        {
            maxExtent: new OpenLayers.Bounds(-236114,41654.75,2204236,1947346.25),
            transitionEffect: null
        }
    );

    var getMdDownloadFormatSelector = function() {
        var fmtOptionData = {
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
    };

    function getMdDownloadFieldset() {
       var fs = pdp.createFieldset("md-fieldset", "Metadata Download");
       var formatDiv = pdp.createDiv("md-format");
       formatDiv.appendChild(getMdDownloadFormatSelector());
       var downloadDiv = pdp.createDiv("download-buttons");
       downloadDiv.appendChild(pdp.createInputElement('button', '', '', '', "Download"))

       fs.appendChild(formatDiv);
       fs.appendChild(downloadDiv);
       return fs;
	   
    }

    var mapButtonsDiv = pdp.createDiv("map-buttons");
    mapButtonsDiv.appendChild(pdp.createInputElement("button", undefined, "legend-button", "legend-button", "View Legend"));
    mapButtonsDiv.appendChild(pdp.createInputElement("button", undefined, "metadata-button", "metadata-button", "View Metadata"));
    map.div.appendChild(mapButtonsDiv);
    
    var mdDialogDiv = pdp.createDiv("metadata-dialog");
    var mdDownloadDiv = pdp.createDiv("md-download");
    mdFieldset = getMdDownloadFieldset();
    mdDownloadDiv.appendChild(mdFieldset);
    var stnListDiv = pdp.createDiv("station-list");
    mdDialogDiv.appendChild(mdDownloadDiv);
    mdDialogDiv.appendChild(stnListDiv);
    map.div.appendChild(mdDialogDiv);
    pdp.createDialog(mdDialogDiv, "Station Metadata", 1000, 600);

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
    var popup;    
    var crmpgetfeatureinfo = function(e, fCount, buff, funcToCall) {
	    var wmsurl = pdp.gs_url + "CRMP/wms?";
	    var stns_lyr = map.getLayersByName('PCDS stations')[0];
	    var lonLat = map.getLonLatFromPixel(e.xy);
	    myX = e.xy.x.toFixed(0);
	    myY = e.xy.y.toFixed(0);
	    myBBox = map.getExtent().toBBOX();
	    myWidth = map.size.w;
	    myHeight = map.size.h;
	    
        var fillPopup = function(response){
            if (popup) map.removePopup(popup);
            tempPopup = getLoadingPopup("temp", lonLat);
            map.addPopup(tempPopup, true);
            if ($('<div/>').append(response.responseText).find('table').length > 0){
                popup = new OpenLayers.Popup.Anchored(
                    "chicken",
                    lonLat,
                    new OpenLayers.Size(200, 200),
                    response.responseText,
                    null,
                    true,
                    null);
                popup.autoSize = true;
                popup.keepInMap = true;
                popup.panMapIfOutOfView = (map.getZoom() != 0);
                map.removePopup(tempPopup);
                map.addPopup(popup, true);
            }
            else
            {
                map.removePopup(tempPopup);
            };
        };
	    // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
	    
        OpenLayers.Request.GET({
            url: wmsurl,
            params: generateGetFeatureInfoParams(map, myX, myY, stns_lyr, fCount, buff),
            success: fillPopup
            });
        // OpenLayers.loadURL(wmsurl, params, this, function(response){
	        // funcToCall(response, lonLat);
	    // });
    };


    
    var callPopup = function(e){
	    var output = crmpgetfeatureinfo(e, 5, 10);
    };
    
    map.events.register('click', map, callPopup);
    
    $('#metadata-button').click(function(e){
       $('#metadata-dialog').dialog("open");
       $('#station-list').html('<p>Loading... <br/><img style="padding-top: 4px; width: 30px; height: 30px;" src="' + pdp.app_root + '/images/anim_loading.gif"/></p>');
       fillMetadata();
    });

    function fixAttrDataFields(colName, value){
	    if (value == null) {
	        return '';
	    };
	    switch (colName){
	    case 'lat':
	    case 'lon': return (value.toFixed(4));
	    case 'max_obs_time' :
	    case 'min_obs_time' : return (value.replace(/ .*/,''));
	    default : return value;
	    };
    };
    var crmpHashNames = {'network_name' : 'Network Name',
			 'native_id'    : 'Native ID',
			 'station_name' : 'Station Name',
			 'lon'          : 'Longitude',
			 'lat'          : 'Latitidue',
			 'elev'         : 'Elev (m)',
			 'min_obs_time' : 'Record Start',
			 'max_obs_time' : 'Record End',
			 'freq'         : 'Frequency'
			};
    
    function fillMetadata(){
        var filters = map.getLayersByName('PCDS stations')[0].params.filter;
        var formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: 'WFS' == 'WMS'});
        var xml = new OpenLayers.Format.XML();

        url = '/geoserver/CRMP/ows?service=WFS';
        params = {
            'version': '1.1.0',
            'request': 'GetFeature',
            'typeName': 'CRMP:crmp_network_geoserver',
            'outputFormat': 'json',
            'srsname': 'epsg:4326'
        };

	if(!filter_undefined(filters))
	    params["FILTER"] = filters;

        url = url + '&' + $.param(params);
	    $.getJSON(url, function(data){
	        var stationCount = (data.features.length)+" stations selected.\n";
	        var tbl_body = '<table class="metafeatureInfo" border="0"><thead><tr>';

            // add the header row first
	        if (data.features.length != 0){
		        $.each(crmpHashNames, function(k,v){
		            tbl_body += '<th align="left" class="attribute">'+v+'</th>';
		        });
		        tbl_body += '</tr></thead><tbody>';

                // then loop through the data & add the data rows
		        $.each(data.features, function(i,feat) {
		            var tbl_row = '';
		            $.each(crmpHashNames, function(k,v){
			            tbl_row += "<td>"+fixAttrDataFields(k, feat.properties[k])+"</td>";
		            });
		            tbl_body += "<tr>"+tbl_row+"</tr>";                 
		        });
		        $("#station-list").html(stationCount+tbl_body+"</tbody></table>");
	        } else {
		        $("#station-list").html("No data selected.");
	        };
	    });
    };
    return map;
};
