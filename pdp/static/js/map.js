var raster_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' and 'ncwms_url' are expected to be set before this is called
// Do this in the sourcing html
var ensemble_datasets;

$(document).ready(function(){
    var popup;
    var selectionBbox;
    var ncwmsCapabilities;
    var dst_selection;
    var catalog;

    function getLayerCapabilities(layername) {
        OpenLayers.Request.GET({url: ncwms_url,
    			                params: {
    				                REQUEST: "GetCapabilities",
    				                SERVICE: "WMS",
    				                VERSION: "1.1.1",
                                    DATASET: layername
    			                },
    			                callback: function(response) {
    				                var xmldoc = $.parseXML(response.responseText);
    				                ncwmsCapabilities = $(xmldoc);
    				                getTimeAvailable();
    			                }
    			               });
    };

    OpenLayers.DOTS_PER_INCH = 90.71428571428572;

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
	    new OpenLayers.Control.MousePosition({div: $('#location')[0]}),
        new OpenLayers.Control.PanZoomBar({position: new OpenLayers.Pixel(2, 15),
                                           panIcons:true})
    ];

    var toolbar = new OpenLayers.Control.Panel({displayClass: 'olControlEditingToolbar', defaultControl: panelControls[0]});
    toolbar.addControls(panelControls);
    mapControls.push(toolbar);
    
    var options = {
        controls: mapControls,
        units: 'degrees',
        projection: new OpenLayers.Projection("EPSG:4326"),
	    resolutions: [0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 
                      0.0054931640625, 0.00274658203125],
        restrictedExtent: new OpenLayers.Bounds(-144,30,-50,90)
    }; 
    
    raster_map = new OpenLayers.Map('canada_map', options);
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    var vectors = new OpenLayers.Layer.Vector("Vector Layer", {
        renderers: renderer
    });

    
    defaults = {dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CSIRO-Mk3-6-0_historical-rcp26_r1i1p1_19500101-21001231",
                variable: "pr"
               }
    
    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        elevation: 0,
        //time: $("#display-date")[0].value.replace(/\//g, '-') + "T00:00:00.000Z",
        transparent: 'true',
        styles: "boxfill/rainbow",
        numcolorbands: 254,
        logscale: false,
        format: 'image/png',
        version: '1.1.1',
        srs: 'EPSG:4326'
    };

    ncwms =  new OpenLayers.Layer.WMS(
        "Climate raster",
		ncwms_url,
		params,
		{
            buffer: 1, 
            ratio: 1.5,
			singleTile: false, 
            wrapDateLine: true, 
            visibility:true, 
            opacity: 0.7,
		    model: 'BCCA+ANUSPLIN300+MPI-ESM-LR',
		    variable: 'pr',
		    scenario: 'historical+rcp85',
		    run:'r3i1p1'
        }
	);

    // Set properties based on default map layer
    $('#map-title').text(params.layers);
    getLayerCapabilities(defaults.dataset);
    dst_selection = params.layers;
    
    ol_wms = new OpenLayers.Layer.WMS(
        "Openlayers WMS",
        "http://tilecache.osgeo.org/wms-c/Basic.py", 
        {
            layers: 'basic'
        },
        {
            tiled: true,
            wrapDateLine: true,
            transitionEffect: "resize",
            serverResolutions:[0.703125, 0.3515625, 0.17578125, 0.087890625, 
                               0.0439453125, 0.02197265625, 0.010986328125, 
                               0.0054931640625, 0.00274658203125, 0.001373291015625, 
                               0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 
                               0.0000858306884765625, 0.00004291534423828125, 0.000021457672119140625]
        }
    );

    gs_wms_proxy = new OpenLayers.Layer.WMS(
        "Canadian Basemap",
        gs_url + "gwc/service/wms",
        {
            layers: "canada_map_wms_proxy",
            format: "image/png"
        },
        {isBaseLayer: true
        }
    );

    raster_map.addLayers([ncwms, ol_wms, gs_wms_proxy, boxLayer]);
    raster_map.setBaseLayer(gs_wms_proxy);
    raster_map.zoomToMaxExtent();

    var slider1 = new OpenLayers.Control.OpacitySlider({layerToOpacisize: ncwms });
    raster_map.addControl(slider1);

    function bboxToIndicies(themap, bnds, extension) {
	    var indexBounds = new OpenLayers.Bounds();

	    function responder(response) {
	        var xmldoc = response.responseXML;
	        var iIndex = parseInt($(xmldoc).find('iIndex').text());
		    var jIndex = parseInt($(xmldoc).find('jIndex').text());
	        if (!isNaN(indexBounds.toGeometry().getVertices()[0].x)) {
		        indexBounds.extend(new OpenLayers.LonLat(iIndex, jIndex)); // not _really_ at lonlat... actually raster space
		        var ti = timeIndicies();
		        var id = dst_selection.split('/')[0]; // strip the variable to get the id
		    var variable = dst_selection.split('/')[1];
		        var url = catalog[id] + '.' + extension + '?' + variable +
			        '[' + ti[0] + ':' + ti[1] + '][' + indexBounds.bottom + ':' + indexBounds.top + '][' + indexBounds.left + ':' + indexBounds.right + ']&';
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
	        alert("Selection area must be of non-zero area (i.e. have extent)");
	        return;
	    };
	    if (! rasterBbox.intersectsBounds(selectionBbox)) {
	        alert('Selection area must intersect the raster area');
	        return;
	    };
	    bboxToIndicies(raster_map, intersection(rasterBbox, selectionBbox), extension);
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
	    // Pull the geographic bounding box out of the appropriate element
	    var bbox = ncwmsCapabilities.find('Layer > Name:contains("' + lyr_name + '")').parent().find('LatLonBoundingBox')[0];
	    var real_bounds = new OpenLayers.Bounds();
	    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.minx.value), parseFloat(bbox.attributes.miny.value)));
	    real_bounds.extend(new OpenLayers.LonLat(parseFloat(bbox.attributes.maxx.value), parseFloat(bbox.attributes.maxy.value)));
	    return real_bounds;
    };

    function getTimeAvailable() {
	    //var lyr_name = ncwms.params.LAYERS;
	    //var stuff = ncwmsCapabilities.find('Layer > Name:contains("' + lyr_name + '")').parent();
	    //var date_range = $.trim(stuff.find('Extent[name="time"]').text()).split('/');
	    //var begin = date_range[0].split('T', 1)[0].replace(/-/g, '/');
	    //var end = date_range[1].split('T', 1)[0].replace(/-/g, '/');
	    var begin = '1950/01/01';
	    var end = '2100/12/31';
	    $.each([".datepickerstart", ".datepickerend"], function(idx, val) {
	        $(val).datepicker('option', 'minDate', begin);
	        $(val).datepicker('option', 'maxDate', end);
	        $(val).datepicker('option', 'yearRange', begin.split('/')[0] + ":" + end.split('/')[0]);
	    });
	    $(".datepicker").datepicker('setDate', begin);
	    $(".datepickerstart").datepicker('setDate', begin);
	    $(".datepickerend").datepicker('setDate', end);
    };

    function timeIndicies() {
	    var base = new Date($(".datepickerstart").datepicker('option', 'minDate'));
	    var t0 = $(".datepickerstart").datepicker('getDate');
	    var tn = $(".datepickerend").datepicker('getDate');
	    var t0i = (t0 - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
	    var tni = (tn - base) / 1000 / 3600 / 24; // Date values are in milliseconds since the epoch
	    return [t0i, tni];
    };

    // Retrieve a tree of available datasets and fill out the selection menu
    $.ajax({'url': app_root + '/ensemble_datasets.json?ensemble_name=' + ensemble_name,
	   'type': 'GET',
	   'dataType': 'json',
	   'success': function(data, textStatus, jqXHR) {
	       ensemble_datasets = data;

	       function get_menu_tree(subtree) {
		   var ul = $("<ul/>")
		   $.each(Object.keys(subtree), function(index, stuff) {
		       var li = $('<li/>');
		       if(subtree[stuff] instanceof Object) {
			   li.append($('<a/>').text(stuff)).append(get_menu_tree(subtree[stuff]));
		       } else {
                   var newlayer = subtree[stuff] + "/" + stuff;
                   li.attr('id', newlayer);
			       $('<a/>').text(stuff).click(function() {
			           ncwms.params.LAYERS = newlayer;
			           ncwms.redraw();
				       dst_selection = newlayer;
                       getLayerCapabilities(subtree[stuff]);
                       $('#map-title').text(newlayer);
                   }).appendTo(li);
		       }
		       li.appendTo(ul);
		   });
		   return ul;
	       };
	       var menu_tree = get_menu_tree(data).attr('id', 'ds-menu');

	       $('#acdnmenu').append(menu_tree);
           amenu.init();
           amenu.open(ncwms.params.LAYERS, true);
	   }
	   }
	  );

    // Find out what datasets are available; receive a dataset_id -> url mapping
    $.ajax({'url': app_root + '/data/catalog.json',
	    'type': 'GET',
	    'dataType': 'json',
	    'success': function(data, textStatus, jqXHR) {
		catalog = data;
	    }}
    );

    $("#timeseries").click(function(){download($('select[name="data-format"]')[0].value);});

    $(canada_map.div).append('<div id="loading-notice" class="invisible"><img style="height: 14px; width: 14px;" src="' + app_root + '/images/anim_loading.gif" alt="Layer loading animation" /> Loading...</div>');
    ncwms.events.register('loadstart',
			  $("#loading-notice"),
			  function(evt) {this.removeClass("invisible");});
    ncwms.events.register('loadend',
			  $("#loading-notice"),
			  function(evt) {this.addClass("invisible");});


});
