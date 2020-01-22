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
    // Note: mocking!
    { module: 'js/__mocks__/data-services/vic_app.js', name: 'dataServices' },

    { module: 'js/pdp_dom_library.js', spread: false },
    { module: 'js/pdp_controls.js', spread: true },
    { module: 'js/pdp_download.js', spread: true },
    { module: 'js/pdp_filters.js', spread: true },
    { module: 'js/pdp_map.js', spread: true },
    { module: 'js/pdp_raster_map.js', spread: true },
    { module: 'js/pdp_vector_map.js', spread: true },

    // VIC outputs app
    { module: 'js/vic_map.js', spread: true },
    { module: 'js/vic_controls.js', spread: true },
    { module: 'js/vic_app.js', name: 'vic_app' },

], '../..');

var dateFilterTests = require('./date-filter-tests');


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

var afterCalendar = calendars['standard'];
var afterUnits = 'days';
var afterCfTimeSystem = new calendars.CfTimeSystem(
    afterUnits,
    new calendars.CalendarDatetime(afterCalendar, 1945, 1, 1),
    56613
);

dateFilterTests(vic_app, {
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
