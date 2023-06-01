test('test', function () {});

require('./app-test-helpers').initializeGlobals();

require('./globals-helpers').importGlobals([
    // External packages
    { module: 'js/ie8.js' },  // execute only
    { module: 'js/jquery-1.10.2.js', name: ['$', 'jQuery'] },
    { module: 'js/jquery-ui-1.10.2.custom.js' }, // execute only
    { module: 'js/multiaccordion.js' },  // jQuery plugin
    { module: 'js/zebra.js' },  // execute only
    { include: 'js/OL/OpenLayers-2.13.1.debug.js' },
    { include: 'js/proj4js-compressed.js' },
    { module: 'js/lodash.custom.js', name: ['_', 'lodash'] },

    // Local packages
    { module: 'js/condExport', name: 'condExport' },
    { module: 'js/classes.js', name: 'classes' },
    { module: 'js/calendars.js', name: 'calendars' },
    // Note: Mocking!
    { module: 'js/__mocks__/data-services/hydro_stn_app.js', name: 'dataServices' },

    { module: 'js/pdp_dom_library.js', spread: false },
    { module: 'js/pdp_controls.js', spread: true },
    { module: 'js/pdp_download.js', spread: true },
    { module: 'js/pdp_filters.js', spread: true },
    { module: 'js/pdp_map.js', spread: true },
    { module: 'js/pdp_raster_map.js', spread: true },

    // Modelled Streamflow Data app
    { module: 'js/jquery.csv-0.71.js' }, // execute only
    { module: 'js/hydro_stn_download.js', spread: true },
    { module: 'js/hydro_stn_map.js', spread: true },
    { module: 'js/hydro_stn_controls.js', spread: true },
    { module: 'js/hydro_stn_app.js', name: 'hydro_stn_app' },

], '../..');

var htmlTemplate = require('./html-template');


var mockHelpers = require('./mock-helpers');
mockHelpers.mock$ajax({ log: true, throw: true });
mockHelpers.mockOLXMLHttpRequest({ log: true, throw: true });


// About as minimal a test suite as you can get. But this app has no date
// filtering code, so we no existing tests to apply.
describe('app', function () {
    beforeEach(function () {
        // Reset the DOM (jsdom)
        document.body.innerHTML = htmlTemplate();
        // resetAllDataServices();
    });

    afterEach(function () {
        // Is this necessary?
        document.body.innerHTML = '';
    });

    it('does\'t explode when you build it', function () {
        hydro_stn_app();
    });
});