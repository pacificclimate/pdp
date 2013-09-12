//var pcds_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var pcds_map;
init_crmp_map = function() {
    
    var popup;
    OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;

    var P4326 = new OpenLayers.Projection("EPSG:4326");
    var P3005 = new OpenLayers.Projection("EPSG:3005");
    var bounds = new OpenLayers.Bounds(
    	    -236114,41654.75,2204236,1947346.25
    );
    var controlOptions = {
        maximized: false,
        size: new OpenLayers.Size(200,170),
        autoPan: false,
        mapOptions: {numZoomLevels: 2}
    };

    // FIXME: the polygon selection stuff should really be added in filters to keep this map indepenedent
    var polygonLayer = new OpenLayers.Layer.Vector("Polygon selection", {'geometryType': OpenLayers.Geometry.Polygon}); // Doesn't seem to be able to handle a Multipolygon
    var panelControls = [
	new OpenLayers.Control.Navigation({'handleRightClicks':true,
					   'zoomBox': new OpenLayers.Control.ZoomBox(),
					   'enabled': true,
					   'selected': true
					  }),
	new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon, {'displayClass': 'olControlDrawFeaturePolygon'})
    ];

    var mapControls = [
        new OpenLayers.Control.LayerSwitcher({'ascending':false}),
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.KeyboardDefaults(),
	new OpenLayers.Control.MousePosition({
	    div: $('#location')[0]}),
        new OpenLayers.Control.PanZoomBar({position: new OpenLayers.Pixel(2, 15),
                                           panIcons:true})
    ]
    var toolbar = new OpenLayers.Control.Panel({displayClass: 'olControlEditingToolbar', defaultControl: panelControls[0]});
    toolbar.addControls(panelControls);
    mapControls.push(toolbar);

    var options = {
        controls: mapControls,
        maxExtent: bounds,
        displayProjection: P4326,
        maxResolution: 2218.5,
        resolutions: [2218.5, 1109.25, 554.625, 277.3125, 138.6562, 69.32812, 34.66406],
        projection: "EPSG:3005",
        units: 'Meter'
    }; 

    pcds_map = new OpenLayers.Map('pcds_map', options);
    
    var crmp = new OpenLayers.Layer.WMS(
        "PCDS stations", gs_url + "CRMP/wms",
        {
            LAYERS: 'CRMP:crmp_network_geoserver',
            tiled: true,
            tilesOrigin : pcds_map.maxExtent.left + ',' + pcds_map.maxExtent.bottom,
            STYLES: '',
            format: 'image/png',
            projection: P4326,
            'transparent':'true'
        },
        {'opacity':1, 'maxExtent': bounds, maxResolution: "auto", 'isBaseLayer': false, 'visibility':true, displayOutsideMaxExtent: true});

    var filter_1_1 = new OpenLayers.Format.Filter({version: "1.1.0"});
    var xml = new OpenLayers.Format.XML();

    var mapbox_base = new OpenLayers.Layer.XYZ(
        "Mapbox",
    [
        "http://a.tiles.mapbox.com/v3/bveerman.map-km2ypj87/${z}/${x}/${y}.png",
        "http://b.tiles.mapbox.com/v3/bveerman.map-km2ypj87/${z}/${x}/${y}.png",
        "http://c.tiles.mapbox.com/v3/bveerman.map-km2ypj87/${z}/${x}/${y}.png",
        "http://d.tiles.mapbox.com/v3/bveerman.map-km2ypj87/${z}/${x}/${y}.png"
    ], {
        attribution: "Tiles &copy; <a href='http://mapbox.com/'>MapBox</a>",
        sphericalMercator: true,
        wrapDateLine: true,
        transitionEffect: "resize",
        displayOutsideMaxExtent: true,
        buffer: 1,
        'maxExtent': bounds,
        maxResolution: "auto"
    });

    var osm_wh = new OpenLayers.Layer.WMS(
        "OpenStreetMap whites",
        gs_url + "gwc/service/wms",
        {LAYERS: 'osm_pnwa_whites_gwc',
         tiled: true,
         tilesOrigin : pcds_map.maxExtent.left + ',' + pcds_map.maxExtent.bottom,
         'transparent' : true},
        {isBaseLayer:true, displayOutsideMaxExtent: true});
    
    pcds_map.addLayers([crmp, polygonLayer, mapbox_base, osm_wh]);
    pcds_map.zoomToMaxExtent();
    pcds_map.setOptions({restrictedExtent: bounds});
    
    var crmpgetfeatureinfo = function(e, fCount, buff, funcToCall) {
	var wmsurl = gs_url + "CRMP/wms?";
	var stns_lyr = pcds_map.getLayersByName('PCDS stations')[0];
	var lonLat = pcds_map.getLonLatFromPixel(e.xy);
	myX = e.xy.x.toFixed(0);
	myY = e.xy.y.toFixed(0);
	myBBox = pcds_map.getExtent().toBBOX();
	mySRS = stns_lyr.params.SRS;
	myWidth = pcds_map.size.w;
	myHeight = pcds_map.size.h;
	
        var params = {
            REQUEST: "GetFeatureInfo",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            BBOX: myBBox,
            SERVICE: "WMS",
            VERSION: "1.1.0",
            X: myX,
            Y: myY,
            INFO_FORMAT: 'text/html',
            QUERY_LAYERS: stns_lyr.params.LAYERS,
            FEATURE_COUNT: fCount,
            LAYERS: 'CRMP:crmp_network_geoserver',
            WIDTH: myWidth,
            HEIGHT: myHeight,
            FORMAT: 'image/png',
            srs: mySRS,
	    filter: stns_lyr.params['filter'],
	    // TO run a slow geoserver GetFeatureRequest for the whole map, uncomment below and set FEATURE_COUNT to something high (e.g. 6000) above
	    BUFFER: buff
	};
	// FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
	OpenLayers.loadURL("/geoserver/CRMP/wms", params, this, function(response){
	    funcToCall(response, lonLat);
	});
    };
    var fillPopup = function(response, lonLat){
	if (popup) pcds_map.removePopup(popup);
	tempPopup = new OpenLayers.Popup.Anchored (
	    "temp",
	    lonLat,
	    new OpenLayers.Size(100, 60),
	    'Loading... <center><img style="padding-top:4px" width=30 height=30 src="' + app_root + '/images/anim_loading.gif"></center>',
	    null,
	    true, // Means "add a close box"
	    null  // Do nothing when popup is closed.
        );
        tempPopup.autoSize = true;
        tempPopup.border = '1px solid #808080';
        pcds_map.addPopup(tempPopup, true);
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
            popup.panMapIfOutOfView = (pcds_map.getZoom() != 0);
            pcds_map.removePopup(tempPopup);
	    pcds_map.addPopup(popup, true);
	}
	else
	{
	    pcds_map.removePopup(tempPopup);
	};
    };
    
    var callPopup = function(e){
	var output = crmpgetfeatureinfo(e, 5, 10, fillPopup);
    };
    var callMetadata = function(e){
	if (popup) pcds_map.removePopup(popup);	    
	$('#stationList').html('Loading... <br/><img style="padding-top:4px" width=30 height=30 src="' + app_root + '/images/anim_loading.gif">');
	//var output = crmpgetfeatureinfo(e, 7000, 6, fillMetadata);
	fillMetadata();
    };
    pcds_map.events.register('click', pcds_map, callPopup);
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
	var filters = pcds_map.composite_filter;
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
};
