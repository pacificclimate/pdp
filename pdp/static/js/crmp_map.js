//var map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var gs_url='http://medusa.pcic.uvic.ca/geoserver/'
var map;
var selectionLayer;

function init_crmp_map() {
    // Map Config
    options = BC3005_map_options();

    // Map Controls
    mapControls = getBasicControls();
    selectionLayer = getPolygonLayer();
    panelControls = getEditingToolbar([getHandNav(), getPolyEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls;

    map = new OpenLayers.Map('pdp-map', options);
    
    var crmp = new OpenLayers.Layer.WMS(
        "PCDS stations", gs_url + "CRMP/wms",
        {
            layers: 'CRMP:crmp_network_geoserver',
            transparent: 'true'
        }
    );

    map.addLayers(
        [crmp,
         selectionLayer,
         getGSBaseLayer(gs_url, "OpenStreetMap brown green", "osm_pnwa_green_brown_gwc"),
         getGSBaseLayer(gs_url, "OpenStreetMap greens", "osm_pnwa_mapquest_gwc"),
         getGSBaseLayer(gs_url, "OpenStreetMap whites", "osm_pnwa_whites_gwc")
        ]
    );
    addLoadingIcon(crmp);
    map.zoomToMaxExtent();
    
    // Additional Functionality
    var popup;    
    var crmpgetfeatureinfo = function(e, fCount, buff, funcToCall) {
	    var wmsurl = gs_url + "CRMP/wms?";
	    var stns_lyr = map.getLayersByName('PCDS stations')[0];
	    var lonLat = map.getLonLatFromPixel(e.xy);
	    myX = e.xy.x.toFixed(0);
	    myY = e.xy.y.toFixed(0);
	    myBBox = map.getExtent().toBBOX();
	    myWidth = map.size.w;
	    myHeight = map.size.h;
	    
        params = generateGetFeatureInfoParams(map, myX, myY, stns_lyr, fCount, buff);
	    // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
	    OpenLayers.loadURL(wmsurl, params, this, function(response){
	        funcToCall(response, lonLat);
	    });
    };

    var fillPopup = function(response, lonLat){
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
    
    var callPopup = function(e){
	    var output = crmpgetfeatureinfo(e, 5, 10, fillPopup);
    };
    var callMetadata = function(e){
	    if (popup) map.removePopup(popup);	    
	    $('#stationList').html('Loading... <br/><img style="padding-top:4px" width=30 height=30 src="' + app_root + '/images/anim_loading.gif">');
	    //var output = crmpgetfeatureinfo(e, 7000, 6, fillMetadata);
	    fillMetadata();
    };
    map.events.register('click', map, callPopup);
    $('#metadata').click(callMetadata);

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
	    var filters = map.composite_filter;
	    var formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: 'WFS' == 'WMS'});
        var xml = new OpenLayers.Format.XML();
	    // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
	    url = '/geoserver/CRMP/ows?service=WFS';
        params = {'version': '1.1.0',
                  'request': 'GetFeature',
                  'typeName': 'CRMP:crmp_network_geoserver',
                  'outputFormat': 'json',
                  'srsname': 'epsg:4326'
                 };

	    if (filters) {
	        params['filter'] = xml.write(formatter.write(filters));
        }

        url = url + '&' + $.param(params);
	    $.getJSON(url, function(data){
	        var stationCount = (data.features.length)+" stations selected.\n";
	        var tbl_body = '<table class="metafeatureInfo" border="0"><tbody><tr>';

            // add the header row first
	        if (data.features.length != 0){
		        $.each(crmpHashNames, function(k,v){
		            tbl_body += '<th align="left" class="attribute">'+v+'</th>';
		        });
		        tbl_body += '</tr>';

                // then loop through the data & add the data rows
		        $.each(data.features, function(i,feat) {
		            var tbl_row = '';
		            $.each(crmpHashNames, function(k,v){
			            tbl_row += "<td>"+fixAttrDataFields(k, feat.properties[k])+"</td>";
		            });
		            tbl_body += "<tr>"+tbl_row+"</tr>";                 
		        });
		        $("#stationList").html(stationCount+tbl_body+"</tbody></table>");
	        } else {
		        $("#stationList").html("No data selected.");
	        };
	    });
    };
    return map;
};
