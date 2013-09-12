// NOTE: variables 'app_root' is expected to be set before this is call
// Do this in the sourcing html

function getActiveFilters() {
	var vs = [];
	for(var i in this) if (this.hasOwnProperty(i) && i != 'values') {
	    vs.push(this[i]);
	}
	return vs;
};

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
	var fts = map.getLayersByName("Polygon selection")[0].features
	if (fts.length == 0) return '';
	var mp = new OpenLayers.Geometry.MultiPolygon(fts.map(function(f) {return f.geometry.clone();}));
	mp.transform(P3005, P4326); // This does a transform _in_place_ (always clone first)
	return mp.toString();
};

