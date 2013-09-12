$(document).ready(function(){
    
    // Fragile; depends very heavily on DOM relationships and ordering
    function get_wms_wfs() {
	var my_type = 'stuff';
	var select_elem = this.parentElement.children[0].children[1];
	var sel_idx = select_elem.options.selectedIndex;
	var req_type = select_elem.options[sel_idx].parentNode.label;
	var url;
	var params;
	var stns_lyr = pcds_map.getLayersByName('PCDS stations')[0];

	var filters = pcds_map.composite_filter;
	var formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: req_type == 'WMS'});
	var xml = new OpenLayers.Format.XML();

	if (req_type == 'WMS') {
	    url = '/geoserver/CRMP/wms?service=WMS';
	    params = {'version': '1.1.0',
		      'request': 'GetMap',
		      'layers': 'CRMP:crmp_network_geoserver',
		      'bbox': pcds_map.getExtent().toBBOX(),
		      'width': pcds_map.size.w,
		      'height': pcds_map.size.h,
		      'srs': stns_lyr.params.SRS,
		      'format': select_elem[sel_idx].value
		     };
	} else if (req_type == 'WFS') {
	    url = '/geoserver/CRMP/ows?service=WFS';
	    params = {'version': '1.1.0',
		      'request': 'GetFeature',
		      'typeName': 'CRMP:crmp_network_geoserver',
		      'outputFormat': select_elem[sel_idx].value,
		      'srsname': 'epsg:4326'
		     };
	}
	if (filters) {
	    params['filter'] = xml.write(formatter.write(filters));
	}

	url = url + '&' + $.param(params);
	window.open(url);
    };
    $('#download-buttons').click(get_wms_wfs);
});
