//var pcds_map; // global so that it's accessible across documents
// NOTE: variables 'gs_url' is expected to be set before this is call
// Do this in the sourcing html

var gs_url='http://medusa.pcic.uvic.ca/geoserver/'
var ncwms_url='http://medusa.pcic.uvic.ca/ncWMS/wms'
var pcds_map;
var selectionLayer;
var current_dataset;
var catalog;

function init_raster_map() {
    var ncwmsCapabilities;

    // Map Config
    options = na4326_map_options();

    // Map Controls
    mapControls = getBasicControls();
    selectionLayer = getBoxLayer();
    panelControls = getEditingToolbar([getHandNav(), getBoxEditor(selectionLayer)]);
    mapControls.push(panelControls);

    options.controls = mapControls    
    pcds_map = new OpenLayers.Map('pcds-map', options);

    var tiles4 = new OpenLayers.Layer.XYZ(
        "TileCache mod_python DiscCache",
        "http://medusa.pcic.uvic.ca/tilecache/tilecache.py/1.0.0/na/${z}/${x}/${y}.png",
        {
            projection: mapControls.projection,
            zoomOffset: 4
        }
    );

    var basemap = getGSBaseLayer(
        gs_url,
        "Canada Basemap",
        "canada_map_wms_proxy",
        getProjection(4326)
    );
    
    defaults = {
        dataset: "pr-tasmax-tasmin_day_BCSD-ANUSPLIN300-CSIRO-Mk3-6-0_historical-rcp26_r1i1p1_19500101-21001231",
        variable: "pr"
    }
    
    params = {
        layers: defaults.dataset + "/" + defaults.variable,
        //time: $("#display-date")[0].value.replace(/\//g, '-') + "T00:00:00.000Z",
        transparent: 'true',
        styles: "boxfill/rainbow",
        numcolorbands: 254,
        logscale: false,
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
            wrapDateLine: true, 
            opacity: 0.7,
		    model: 'BCCA+ANUSPLIN300+MPI-ESM-LR',
		    variable: 'pr',
		    scenario: 'historical+rcp85',
		    run:'r3i1p1'
        }
	);

    $('#map-title').text(params.layers);
    getNCWMSLayerCapabilities(ncwmsCapabilities, ncwms_url, defaults.dataset); // async save into global var ncwmsCapabilities
    current_dataset = params.layers;

    pcds_map.addLayers(
        [
            ncwms,
            selectionLayer,
            basemap,
            tiles4
        ]
    );

    slider = getSlider(ncwms);
    pcds_map.addControl(slider);
    addLoadingIcon(ncwms);
    pcds_map.zoomToMaxExtent();

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
        rasterBBoxToIndicies(raster_map, current_dataset, intersection(rasterBbox, selectionBbox), extension);
    };

    $("#timeseries").click(function(){download($('select[name="data-format"]')[0].value);});

};
$(document).ready(init_raster_map);