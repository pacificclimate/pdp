// NOTE: variables 'app_root' is expected to be set before this is call
// Do this in the sourcing html

var pcds_map;
var last_req_time = Date();
function init_filters() {

    pcds_map.filters = {};
    function values() {
	var vs = [];
	for(var i in this) if (this.hasOwnProperty(i) && i != 'values') {
	    vs.push(this[i]);
	}
	return vs;
    };
    pcds_map.filters.values = values;
    pcds_map.composite_filter = '';

    function pp_bignum(n) {
	if (n > 1e9) return Math.floor(n / 1e9).toString() + 'G';
	if (n > 1e6) return Math.floor(n / 1e6).toString() + 'M';
	if (n > 1e3) return Math.floor(n / 1e3).toString() + 'k';
	return n;
    };


    // Returns a WKT formatted multipolygon of the user's polygon selection (or empty string if there are polygons)
    function polygon_as_text() {
	var P4326 = new OpenLayers.Projection("EPSG:4326");
	var P3005 = new OpenLayers.Projection("EPSG:3005");
	var fts = pcds_map.getLayersByName("Polygon selection")[0].features
	if (fts.length == 0) return '';
	var mp = new OpenLayers.Geometry.MultiPolygon(fts.map(function(f) {return f.geometry.clone();}));
	mp.transform(P3005, P4326); // This does a transform _in_place_ (always clone first)
	return mp.toString();
    };

    function net_filter(net_name) {
	return new OpenLayers.Filter.Comparison({
    	    type: "==",
    	    property: "network_name",
    	    value: net_name});
    };
    
    function date_filter(sdate, edate) {
        var d = new Date();
        if (edate == 'YYYY/MM/DD') edate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); //today
	if (sdate == 'YYYY/MM/DD') sdate = '1870/01/01'; // ~beginning of our data (unless we find a magic data set)
	// http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
	return new OpenLayers.Filter.Logical({
    	    type: OpenLayers.Filter.Logical.AND,
    	    filters: [
    		new OpenLayers.Filter.Comparison({
    		    type: ">=",
    		    property: "max_obs_time",
    		    value: sdate}),
    		new OpenLayers.Filter.Comparison({
    		    type: "<=",
    		    property: "min_obs_time",
    		    value: edate})
    	    ]
    	});
	
    };
    function freq_filter(freq) {
	return new OpenLayers.Filter.Comparison({
    	    type: "==",
    	    property: "freq",
    	    value: freq});
    };
    function var_filter(stn_var) {
	return new OpenLayers.Filter.Comparison({
	    type: "~",
	    property: "vars",
	    value: "*" + stn_var + "*"});
    };

    function polygon_filter() {
	var P4326 = new OpenLayers.Projection("EPSG:4326");
	var P3005 = new OpenLayers.Projection("EPSG:3005");
	function feat2filt(feat) {
	    my_copy = feat.geometry.clone();
	    my_copy.transform(P3005, P4326); // This does a transform _in_place_
	    return new OpenLayers.Filter.Spatial({
		type: "INTERSECTS",
		value: my_copy
	    });
	};
	var lyr = pcds_map.getLayersByName("Polygon selection")[0];
	var filters = lyr.features.map(feat2filt);
	return new OpenLayers.Filter.Logical({
	    type: OpenLayers.Filter.Logical.OR,
	    filters: filters
	});
    };

    function has_climatology_filter() {
	return new OpenLayers.Filter.Comparison({
	    type: "~",
	    property: "vars",
	    value: "%within%"
	});
    };

    function update_station_count() {
	$.ajax({'url': app_root + '/apps/count_stations',
		'data': $('form').serialize(),
		'type': 'GET',
		'dataType': 'json',
		'success': function(data, textStatus, jqXHR) {
		    box = $("#infobox")[0];
		    box.readonly = null;
		    box.innerHTML = box.innerHTML.replace(/[0-9]+ stations/g, data.stations_selected.toString() + ' stations');
		    box.readonly = 'readonly';
		}
	       }
	      )
    }

    function update_record_length() {
	box = $("#infobox")[0];
	box.innerHTML = box.innerHTML.replace(/[0-9]+[GMk]? observations/g, '??? observations');
	box.innerHTML = box.innerHTML.replace(/[0-9]+[GMk]? climatologies/g, '??? climatologies');
	var req_time = last_req_time = Date();

	$.ajax({'url': app_root + '/apps/record_length',
		'data': $('form').serialize(),
		'type': 'GET',
		'dataType': 'json',
		'success': function(data, textStatus, jqXHR) {
		    if (req_time < last_req_time) return;
		    box.readonly = null;
		    box.innerHTML = box.innerHTML.replace(/([0-9]+[GMk]?|[?]{3}) observations/g, pp_bignum(data.record_length) + ' observations');
		    box.innerHTML = box.innerHTML.replace(/([0-9]+[GMk]?|[?]{3}) climatologies/g, pp_bignum(data.climo_length) + ' climatologies');
		    box.readonly = 'readonly';
		}
	       }
	      )
    }

    function update_filter_layer() {
	var lyr = pcds_map.getLayersByName('PCDS stations')[0]; // FIXME: assumes that var pcds_map is global or in scope
	var formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: true}); // For wMs (not wFs)
	var xml = new OpenLayers.Format.XML();
	var filter = pcds_map.composite_filter;
	lyr.params['filter'] = xml.write(formatter.write(filter));
	lyr.redraw();
    };

    function on_filter_change() {
	$("#input-polygon").val(polygon_as_text());
	var composite_filter = new OpenLayers.Filter.Logical({
    	    type: OpenLayers.Filter.Logical.AND,
    	    filters: pcds_map.filters.values()
	});
	pcds_map.composite_filter = composite_filter;
	update_filter_layer();
	update_station_count();
	update_record_length();
    };
    function filter_append(fil) {
	pcds_map.filters.push(fil);
	on_filter_change();
    };

    function filter_clear() {
	pcds_map.filters = {};
	pcds_map.filters.values = values;
	pcds_map.getLayersByName("Polygon selection")[0].removeAllFeatures();
    };
    
    function dateChange() {
	var sdate = $('#from-date').val();
	var edate = $('#to-date').val();
	var fil = date_filter(sdate, edate);
	pcds_map.filters.date = fil;
    };
    function netChange() {
	var net = $('#input-network').val();
	if (net) {
	    pcds_map.filters.network = net_filter(net);
	} else {
	    delete pcds_map.filters['network'];
	}
    };
    function freqChange() {
	var freq = $('#input-freq').val();
	if (freq) {
	    pcds_map.filters.freq = freq_filter(freq);
	} else {
	    delete pcds_map.filters['freq'];
	}	
    };
    function varChange() {
	var stn_var = $('#input-var').val();
	if (stn_var) {
	    pcds_map.filters.stn_var = var_filter(stn_var);
	} else {
	    delete pcds_map.filters['stn_var'];
	}
    };
    function polyChange(e) {
	var fil = polygon_filter();
	pcds_map.filters.polygon = fil;
	on_filter_change();
//	alert('Polygon completed');
    };
    function hasClimaChange(e) {
	var clima_checked = $('#input-climatology').attr('checked');
	if (clima_checked) {
	    pcds_map.filters.has_clima = has_climatology_filter();
	} else {
	    delete pcds_map.filters['has_clima'];
	}
    };
    pcds_map.getControlsByClass('OpenLayers.Control.DrawFeature')[0].events.register('featureadded', '', polyChange);
    
    $('#from-date').change(dateChange).change(on_filter_change);
    $('#to-date').change(dateChange).change(on_filter_change);
    $('#input-network').change(netChange).change(on_filter_change);
    $('#input-freq').change(freqChange).change(on_filter_change);
    $('#input-var').change(varChange).change(on_filter_change);
    $('#with-climatology').click(hasClimaChange).change(on_filter_change);
    // the date filter actually _does_ need to be reimposed after filter reset, in order to filter out the stations that don't have start/end dates
    $('#filter').bind('reset', filter_clear).bind('reset', dateChange).bind('reset', on_filter_change);
    dateChange(); netChange(); freqChange(); varChange(); hasClimaChange(); on_filter_change();
};
