var each = require('jest-each').default;


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
    { module: 'js/__mocks__/data-services/crmp_app.js', name: 'dataServices' },

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


var mockHelpers = require('./mock-helpers');
mockHelpers.mock$ajax({ log: true, throw: true });
mockHelpers.mockOLXMLHttpRequest({ log: true, throw: true });
var htmlTemplate = require('./html-template');


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
    omitsDownloadFullTimeSeriesCheckbox: true,
});


describe('CRMP app', function() {
    beforeEach(function () {
        // Reset the DOM (jsdom)
        document.body.innerHTML = htmlTemplate();
        mockHelpers.resetAll(dataServices);
        mockHelpers.resolveAllWithDefault(dataServices);
        crmp_app();
    });

    afterEach(function () {
        // Is this necessary?
        document.body.innerHTML = '';
    });

    describe('Reset Filters button', function() {
        it('Resets the date filters to valid values', function () {
            // Enter dates into the date range input elements
            $('#from-date').val('1950/01/01').change();
            $('#to-date').val('1951/01/01').change();

            // Click Reset Filters button
            $('#filter-reset').click();

            // Check that date range input elements have been reset
            expect($('#from-date').val()).toBe('1870/01/01');
            today = new Date();
            expect($('#to-date').val()).toBe(calendars.formatDatetimeLoose(
              today.getFullYear(), today.getMonth() + 1, today.getDate()
            ));
        });
    });
});


describe('Download buttons', function () {
    beforeEach(function () {
        // Reset the DOM (jsdom)
        document.body.innerHTML = htmlTemplate();
        mockHelpers.resetAll(dataServices);
        mockHelpers.resolveAllWithDefault(dataServices);
        crmp_app();
    });

    afterEach(function () {
        // Is this necessary?
        document.body.innerHTML = '';
    });

    each([
        '#from-date',
        '#to-date',
    ]).describe('%s', function (dateSelector) {
        each([
            ['1950/01/01', true],
            ['1950/01/99', false],
        ]).describe('= %s', function (dateString, validEntry) {
            var $date;
            beforeEach(function () {
                // Enter data in the input element
                $date = $(dateSelector);
                $date.val(dateString);
                $date.change();
                console.log('validEntry', $date.data('validEntry'))
            });

            each([
                '#download-climatology',
                '#download-timeseries',
            ]).describe('%s button', function (buttonSelector) {
                it('is ' + (validEntry ? 'enabled' : 'disabled'), function () {
                    expect($(buttonSelector).prop('disabled')).toBe(!validEntry)
                });
            });
        });
    });
});