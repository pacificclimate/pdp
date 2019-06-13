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
    { module: 'js/data-services.js', name: 'dataServices' },

    { module: 'js/pdp_dom_library.js', spread: false },
    { module: 'js/pdp_controls.js', spread: true },
    { module: 'js/pdp_download.js', spread: true },
    { module: 'js/pdp_filters.js', spread: true },
    { module: 'js/pdp_map.js', spread: true },
    { module: 'js/pdp_raster_map.js', spread: true },
    { module: 'js/pdp_vector_map.js', spread: true },

    // BC Station Data - PCDS app
    { module: 'js/crmp_map.js', spread: true },
    { module: 'js/crmp_controls.js', spread: true },
    { module: 'js/crmp_download.js', spread: true },
    { module: 'js/crmp_filters.js', spread: true },
    { module: 'js/crmp_app.js', name: 'crmp_app' },

], '../..');

var dateFilterTests = require('./date-filter-tests');


jest.mock('../../js/data-services');
var dataServices = require('../../js/data-services');


var mockHelpers = require('./mock-helpers');
mockHelpers.mock$ajax({ log: true, throw: true });
mockHelpers.mockOLXMLHttpRequest({ log: true, throw: true });


var calendar = calendars['gregorian'];
var units = 'days';
var cfTimeSystem = new calendars.CfTimeSystem(
    units,
    new calendars.CalendarDatetime(calendar, 1870, 1, 1),
    Math.floor((2100 - 1870 + 1) * 365.2425)
);
var defaultStartDate = cfTimeSystem.firstCfDatetime();
var defaultEndDate = cfTimeSystem.todayAsCfDatetime();

dateFilterTests(crmp_app, {
    cfTimeSystem: {
        before: cfTimeSystem,
        after: cfTimeSystem,
    },
    defaultStartDate: {
        before: defaultStartDate,
        after: defaultStartDate
    },
    defaultEndDate: {
        before: defaultEndDate,
        after: defaultEndDate
    },
    omitsDownloadDataLink: true,
    omitsloadFullTimeSeriesCheckbox: true,
});
