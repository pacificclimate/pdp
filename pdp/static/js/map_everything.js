function init() {
    var pcds_map;
    init_crmp_map(); // from crmp_map.js
    init_filters();  // from pcds_filters.js
    init_login(); // from auth.js
}

// this is the right way to do it
//$(document).ready(init);

// but we have to do this for OL to load under IE7 and BC government security settings
window.onload = init;
