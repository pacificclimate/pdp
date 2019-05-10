function initializeGlobals() {
    window.pdp = {
        VERSION: '0.1',
        app_root: 'https://data.pacificclimate.org/portal',
        data_root: 'https://data.pacificclimate.org/data',
        gs_url: 'geoserver_url',
        ncwms_url: 'ncwms_url',
        tilecache_url: [
            'tilecache_url'
        ],
        ensemble_name: 'ensemble_name'
    };
}


module.exports = {
    initializeGlobals: initializeGlobals
};