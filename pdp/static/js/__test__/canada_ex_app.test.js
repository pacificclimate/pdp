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

    // Statistically Downscaled GCM Scenarios apps
    { module: 'js/canada_ex_map.js', spread: true },
    { module: 'js/canada_ex_app.js', name: 'canada_ex_app' },
], '../..');

var dateFilterTests = require('./date-filter-tests');


jest.mock('../../js/data-services');
var dataServices = require('../../js/data-services');


var mockHelpers = require('./mock-helpers');
mockHelpers.mock$ajax({ log: true, throw: true });
mockHelpers.mockOLXMLHttpRequest({ log: true, throw: true });


var beforeCalendar = calendars['gregorian'];
var beforeUnits = 'days';
var beforeCfTimeSystem = new calendars.CfTimeSystem(
    beforeUnits,
    new calendars.CalendarDatetime(beforeCalendar, 1870, 1, 1),
    Math.floor((2100 - 1870 + 1) * 365.2425)
);

var afterCalendar = calendars['365_day'];
var afterUnits = 'days';
var afterCfTimeSystem = new calendars.CfTimeSystem(
    afterUnits,
    new calendars.CalendarDatetime(afterCalendar, 1950, 1, 1),
    Math.floor((2100 - 1950 + 1) * 365)
);

dateFilterTests(canada_ex_app, {
    cfTimeSystem: {
        before: beforeCfTimeSystem,
        after: afterCfTimeSystem,
    },
    defaultStartDate: {
        before: beforeCfTimeSystem.firstCfDatetime(),
        after: afterCfTimeSystem.firstCfDatetime()
    },
    defaultEndDate: {
        before: beforeCfTimeSystem.lastCfDatetime(),
        after: afterCfTimeSystem.lastCfDatetime()
    }
});
