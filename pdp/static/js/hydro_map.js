var hydro_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' and 'ncwms_url' are expected to be set before this is called
// Do this in the sourcing html

$(document).ready(function(){
    
    var P4326 = new OpenLayers.Projection("EPSG:4326");
    var popup;
    var selectionBbox;
    var ncwmsCapabilities;

    // On page load, send an AJAX request to get the bounding box of all layers in geographic coordinates
    // store as an XML tree
    // FIXME: URL
    OpenLayers.Request.GET({url: ncwms_url,
			    params: {
				REQUEST: "GetCapabilities",
				SERVICE: "WMS",
				VERSION: "1.1.1"
			    },
			    callback: function(response) {
				var xmldoc = response.responseXML;
				ncwmsCapabilities = $(xmldoc);
				getTimeAvailable();
			    }
			   });
    
    OpenLayers.DOTS_PER_INCH = 90.71428571428572;

    var P4326 = new OpenLayers.Projection("EPSG:4326");
    var bounds = new OpenLayers.Bounds(
	//-142.62,46.11,-109.13,63.10);
	    -139.475,45.8925,-111.975,63.8675);
    // 139.60398687339,44.168234520035,-112.10398687339,62.143234520035);

    var boxLayer = new OpenLayers.Layer.Vector("Box selection");
    // Allow only one rectangle at a time
    boxLayer.events.register('beforefeatureadded',
			     boxLayer,
			     function(evt) {
				 this.removeAllFeatures();
				 boxLayer.ncbounds = new OpenLayers.Bounds();
			     });
    boxLayer.events.register('featureadded',
			     boxLayer,
			     function(evt) {
				 selectionBbox = this.features[0].geometry.getBounds();});

    var panelControls = [
	new OpenLayers.Control.Navigation({'handleRightClicks':true,
					   'zoomBox': new OpenLayers.Control.ZoomBox(),
					   'enabled': true,
					   'selected': true
					  }),
	new OpenLayers.Control.DrawFeature(boxLayer,
					   OpenLayers.Handler.RegularPolygon, { handlerOptions: {sides: 4, irregular: true },
									        displayClass: 'olControlDrawFeaturePolygon'}
					  ),
    ];

    var mapControls = [
        new OpenLayers.Control.LayerSwitcher({'ascending':false}),
        new OpenLayers.Control.ScaleLine({maxWidth:250}),
        new OpenLayers.Control.KeyboardDefaults(),
	new OpenLayers.Control.MousePosition({
	    div: $('#hydro_location')[0]}),
        new OpenLayers.Control.PanZoomBar({position: new OpenLayers.Pixel(2, 15),
                                           panIcons:true})
    ];

    var toolbar = new OpenLayers.Control.Panel({displayClass: 'olControlEditingToolbar', defaultControl: panelControls[0]});
    toolbar.addControls(panelControls);
    mapControls.push(toolbar);
    
    var options = {
        controls: mapControls,
	maxExtent: new OpenLayers.Bounds(-140.0,20.0,-10,80),
	//maxExtent: bounds,
        projection: P4326,
	resolutions: [0.025,0.0125,0.00625,0.003125,0.0015625],
        maxResolution: 0.025,
        units: 'degrees',
    }; 
    
    hydro_map = new OpenLayers.Map('hydro_map', options);
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    var vectors = new OpenLayers.Layer.Vector("Vector Layer", {
        renderers: renderer
    });
    
    params = {
        layers: "peace_calib_cc_cccma_cgcm3_A1Brun1_vic5fluxes/sm",
        elevation: 0,
        time: $("#display-date")[0].value.replace(/\//g, '-') + "T00:00:00.000Z",
        transparent: 'true',
        styles: "boxfill/rainbow",
        //colorscalerange: "-0.01953589,0.70485246",
	//colorscalerange: "-0.0014597828,0.030655438",
        numcolorbands: 254,
        logscale: false,
        format: 'image/png',
        version: '1.1.1',
        srs: 'EPSG:4326'
    };
    ncwms =  new OpenLayers.Layer.WMS("Climate raster",
				      ncwms_url,
				      params,
				      {buffer: 1, ratio: 1.5,
				       singleTile: false, wrapDateLine: true, visibility:true, opacity: 0.7,
				       scenario: 'A1B',
                                       model: 'cccma_cgcm3',
				       variable: 'sm'}
				     );

    osm = new OpenLayers.Layer.WMS(
        "OpenStreetMap",
        gs_url + "gwc/service/wms",
        //gs_url + "/wms",
        {LAYERS: 'osm_pnwa_4326_gwc',
         tiled: true,
         //tilesOrigin : '-140.125, 45.5925',
         tilesOrigin : hydro_map.maxExtent.left + ',' + hydro_map.maxExtent.bottom,
         'transparent' : true},
        {tileSize: new OpenLayers.Size(256,256), isBaseLayer:true, displayOutsideMaxExtent: true, wrapDateLine: false});

    hydro_map.addLayers([osm, ncwms, boxLayer]);
    hydro_map.zoomToExtent(bounds);

    hydro_map.setOptions({restrictedExtent: bounds});
    var slider1 = new OpenLayers.Control.OpacitySlider({layerToOpacisize: ncwms });
    hydro_map.addControl(slider1);

    function onSelect() {
	var prop = this.name.replace(/input-/, "");
	ncwms[prop] = this.value;
	var layer_name = "peace_calib_cc_" + ncwms.model + "_" + ncwms.scenario + "run1_vic5fluxes/" + ncwms.variable;
	ncwms.params.LAYERS = layer_name;
	ncwms.redraw();
    };

    function onTimeChange() {
	ncwms.params.TIME = $("#display-date")[0].value.replace(/\//g, '-') + "T00:00:00.000Z",
	ncwms.redraw();
    };

    function bboxToIndicies(themap, bnds, extension) {
	var indexBounds = new OpenLayers.Bounds();

	function responder(response) {
	    var xmldoc = response.responseXML;
	    var iIndex = parseInt($(xmldoc).find('iIndex').text());
            var jIndex = parseInt($(xmldoc).find('jIndex').text());
	    if (!isNaN(indexBounds.toGeometry().getVertices()[0].x)) {
		indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
		//alert(indexBounds.left + ' ' + indexBounds.top + ' ' +  indexBounds.right + ' ' +  indexBounds.bottom);
		var data_file = "peace_calib_cc_" + ncwms.model + "_" + ncwms.scenario + "run1_vic5fluxes.nc";
		var ti = timeIndicies();
		url = '/james_crmp/auth/pydap/hydro_peace/' + data_file + '.' + extension + '?' + ncwms.variable + '[' + ti[0] + ':' + ti[1] + '][' + indexBounds.bottom + ':' + indexBounds.top + '][' + indexBounds.left + ':' + indexBounds.right + ']&'; // FIXME: pydap path
		window.open(url, 'foo');
	    } else { // first response... wait for the second
		indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
	    }
	};
	function requestIndex(x, y) {
            var params = {
		REQUEST: "GetFeatureInfo",
		BBOX: themap.getExtent().toBBOX(),
		SERVICE: "WMS",
		VERSION: "1.1.1",
		X: x,
		Y: y,
		QUERY_LAYERS: ncwms.params.LAYERS,
		LAYERS: ncwms.params.LAYERS,
		WIDTH: themap.size.w,
		HEIGHT: themap.size.h,
		srs: ncwms.params.SRS,
		CRS: "EPSG:4326",
		INFO_FORMAT: 'text/xml'
	    };
	    // FIXME: URL below assumes that geoserver is running on the same machine as the webapp (or a proxy is in place)
	    OpenLayers.Request.GET({url: ncwms_url,
				    params: params,
				    callback: responder});
	};
	var ul = themap.getPixelFromLonLat(new OpenLayers.LonLat(bnds.left, bnds.top));
	var lr = themap.getPixelFromLonLat(new OpenLayers.LonLat(bnds.right, bnds.bottom));
	requestIndex(ul.x, ul.y);
	requestIndex(lr.x, lr.y);
    };

    function download(extension) {
	// Check input
	if (selectionBbox == undefined) {
	    alert("You need to first select a rectangle of data to download (use the polygon tool in the top, right corner of the map.");
	    return;
	};
	if (ncwmsCapabilities == undefined) {
	    alert("I'm still trying to determine the geographic bounds of the selected layer.  Try again in a few seconds.");
	    return;
	};
	rasterBbox = getRasterBbox();
	if (selectionBbox.toGeometry().getArea == 0) {
	    alert("Selection area must be of non-zero area (i.e. have extant)");
	    return;
	};
	if (! rasterBbox.intersectsBounds(selectionBbox)) {
	    alert('Selection area must intersect the raster area');
	    return;
	};
	bboxToIndicies(hydro_map, intersection(rasterBbox, selectionBbox), extension);
    };

    // take the intersection of two OpenLayers.Bounds
    function intersection(b1, b2) {
	return new OpenLayers.Bounds(Math.max(b1.left, b2.left),
				     Math.max(b1.bottom, b2.bottom),
				     Math.min(b1.right, b2.right),
				     Math.min(b1.top, b2.top));
    };

    // The WMS layer doesn't seem to have the bbox of the _data_ available, which I would like to have
    function getRasterBbox() {
	var lyr_name = ncwms.params.LAYERS;
	var stuff = ncwmsCapabilities.find(lyr_name);
	// Pull the geographic bounding box out of the appropriate element
	var bbox = ncwmsCapabilities.find('Layer > Name:contains("' + lyr_name + '")').parent().find('LatLonBoundingBox')[0];
	var real_bounds = new OpenLayers.Bounds();
	real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.minx.value), parseFloat(bbox.attributes.miny.value)));
	real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.maxx.value), parseFloat(bbox.attributes.maxy.value)));
	return real_bounds;
    };

    function getTimeAvailable() {
	var lyr_name = ncwms.params.LAYERS;
	var stuff = ncwmsCapabilities.find('Layer > Name:contains("' + lyr_name + '")').parent();
	var date_range = $.trim(stuff.find('Extent[name="time"]').text()).split('/');
	var begin = date_range[0].split('T', 1)[0].replace(/-/g, '/');
	var end = date_range[1].split('T', 1)[0].replace(/-/g, '/');
	$.each([".datepicker", ".datepickerstart", ".datepickerend"], function(idx, val) {
	    $(val).datepicker('option', 'minDate', begin);
	    $(val).datepicker('option', 'maxDate', end);
	    $(val).datepicker('option', 'yearRange', begin.split('/')[0] + ":" + end.split('/')[0]);
	});
	$(".datepicker").datepicker('setDate', begin);
	$(".datepickerstart").datepicker('setDate', begin);
	$(".datepickerend").datepicker('setDate', end);
    };

    function timeIndicies() {
	var base = new Date($(".datepicker").datepicker('option', 'minDate'));
	var t0 = $(".datepickerstart").datepicker('getDate');
	var tn = $(".datepickerend").datepicker('getDate');
	var t0i = (t0 - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
	var tni = (tn - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
	return [t0i, tni];
    }

    $('#input-variable').change(onSelect);
    $('#input-model').change(onSelect);
    $('#input-scenario').change(onSelect);
    $('#display-date').change(onTimeChange);

    $("#timeseries").click(function(){download($('select[name="data-format"]')[0].value);});

    // FIXME: URL
    $(hydro_map.div).append('<div id="loading-notice" class="invisible"><img style="height: 14px; width: 14px;" src="/james_crmp/images/anim_loading.gif" alt="Layer loading animation" /> Loading...</div>');
    ncwms.events.register('loadstart',
			  $("#loading-notice"),
			  function(evt) {this.removeClass("invisible");});
    ncwms.events.register('loadend',
			  $("#loading-notice"),
			  function(evt) {this.addClass("invisible");});



});
