function initializeGlobals() {
    window.pdp = {
        VERSION: '0.1',
        // app_root and data_root need to match content returned by data
        // services mocks (in particular, by the catalog mock).
        // No real data was molested in the making of these tests.
        app_root: 'https://data.fake.org/portal',
        data_root: 'https://data.fake.org/data',
        gs_url: 'geoserver_url',
        ncwms_url: 'ncwms_url',
        tilecache_url: [
            'tilecache_url'
        ],
        'bc_basemap_url': 'bc_basemap_url',
        ensemble_name: 'ensemble_name',
    };
}


module.exports = {
    initializeGlobals: initializeGlobals
};