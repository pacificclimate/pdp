var each = require('jest-each').default;

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

require('./globals-helpers').importGlobals([
    // External packages
    { module: 'js/ie8.js' },  // execute only
    { module: 'js/jquery-1.10.2.js', name: ['$', 'jQuery'] },
    { module: 'js/jquery-ui-1.10.2.custom.js' }, // execute only
    { module: 'js/multiaccordion.js' },  // jQuery plugin
    { module: 'js/zebra.js' },  // execute only
    { include: 'js/OL/OpenLayers-2.13.1.debug.js' },
    { include: 'js/proj4js-compressed.js' },
    { module: 'js/lodash.core.js', name: ['_', 'lodash'] },

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
    { module: 'js/canada_ex_map.js', spread: true },
    { module: 'js/canada_ex_app.js', name: 'canada_ex_app' },
], '../..');


jest.mock('../../js/data-services');
var dataServices = require('../../js/data-services');


var docBody = document.body;


describe('jQuery data', function () {
    document.body.innerHTML = '<div></div>';
    var $elt = $('div');

    it('can set and retrieve string data', function () {
        $elt.data('test', 'TEST');
        expect($elt.data('test')).toBe('TEST');
    });

    it('can set and retrieve object data', function () {
        $elt.data('test', { a: 1, b: 2 });
        expect($elt.data('test')).toEqual({ a: 1, b: 2 });
    });
});


// The following lets us check whether there are any actual $.ajax() calls.
// At this time, all data service calls are mocked
// in `__mocks__/data-services.js`.
var $ajax = $.ajax;
$.ajax = function() {
    console.log('$.ajax(): request', arguments);
    var response = $ajax.apply(arguments);
    response.done(function () {
        console.log('$.ajax(): response', arguments, response);
    });
    return response;
};

describe('app', function () {
    beforeEach(function () {
        // Reset the DOM (jsdom)
        docBody.innerHTML =
            // Copied from pdp/templates/map.html
            '<div id="wrapper">' +
            '   <div id="header">' +
            '      <a href="http://pacificclimate.org"><img src="${app_root}/images/banner.png" alt="PCIC Logo" /></a>' +
            '      <h1>${title}</h1>' +
            '      <div style="clear"></div>' +
            '      <div id="topnav">' +
            '        <ul class="menu">' +
            '          <li><a href="http://pacificclimate.org">PCIC Home</a></li>' +
            '          <li><a href="${app_root}/docs/" target="_blank">User Docs</a></li>' +
            '        </ul>' +
            '      <div id="login-div" style="visibility:hidden"></div>' +
            '      </div><!-- /topnav -->' +
            '    </div><!-- /header -->' +
            '    <div id="main">' +
            '      <div id="map-wrapper">' +
            '        <div class="relative">' +
            '          <div id="pdp-map" style="width: 100%; height: 100%"></div>' +
            '          <div id="map-title"></div>' +
            '          <div id="location"></div>' +
            '          <div id="pdpColorbar"></div>' +
            '        </div>' +
            '      </div>' +
            '      <div id="pdp-controls"></div>' +
            '   </div><!-- /main -->' +
            '   <div id="footer">' +
            '        <ul class="menu">' +
            '          <li>PCIC Data Portal version ${version} (${revision})</li>' +
            '          <li><a href="http://www.pacificclimate.org/terms-of-use/">Terms of Use</a></li>' +
            '        </ul>' +
            '     </div><!-- /footer -->' +
            '</div><!-- /wrapper -->';

        canada_ex_app();
    });

    afterEach(function () {
        // Is this necessary?
        docBody.innerHTML = '';
    });

    function getDownloadCfDate(selector) {
        var $downloadForm = $('#download-form');
        var $date = $downloadForm.find(selector);
        return $date.data('cfDate');
    }

    function logDownloadDates() {
        // For debugging. Now disabled.
        return;
        var fromDate = getDownloadCfDate('#from-date');
        var toDate = getDownloadCfDate('#to-date');
        console.log(
            '#from-date', fromDate && fromDate.toLooseString(true),
            '#to-date', toDate && toDate.toLooseString(true)
        );
    }

    function resolveAlldataServices() {
        logDownloadDates();
        dataServices.getMetadata.resolveWithDefault();
        logDownloadDates();
        dataServices.getCatalog.resolveWithDefault();
        logDownloadDates();
        dataServices.getNCWMSLayerCapabilities.resolveWithDefault();
        logDownloadDates();
        dataServices.getNcwmsLayerDDS.resolveWithDefault();
        logDownloadDates();
        dataServices.getNcwmsLayerDAS.resolveWithDefault();
        logDownloadDates();
    }

    test('mocking', function () {
        resolveAlldataServices();
    });

    describe('Download form', function () {
        var $downloadForm;

        beforeEach(function () {
            $downloadForm = $('#download-form');
        });

        it('exists', function () {
            expect($downloadForm.length).toBe(1);
        });

        describe('date inputs', function () {
            describe('setup', function () {
                each([
                    ['before data services resolve', function() {}],
                    ['after data services resolve', resolveAlldataServices],
                ]).describe('%s', function (label, setup) {
                    beforeEach(function () {
                        setup();
                    });

                    each([
                        ['#from-date', 1950],
                        ['#to-date', (new Date()).getFullYear()],
                    ]).describe('%s', function (selector, year) {

                        it('exists', function () {
                            var $date = $downloadForm.find(selector);
                            expect($date.length).toBe(1);
                        });

                        it('has expected element content', function () {
                            var $date = $downloadForm.find(selector);
                            expect($date.val()).toMatch(year + '/');
                        });

                        it('has expected attached cfDate', function () {
                            var $date = $downloadForm.find(selector);
                            var cfDate = $date.data('cfDate');
                            console.log('test', selector, 'cfDate =', cfDate)
                            expect(cfDate).toBeDefined();
                            var calDatetime = cfDate.toCalendarDatetime();
                            expect(calDatetime.datetime.year).toEqual(year);
                        });
                    });
                });
            });

            describe('messages', function () {
                beforeEach(function () {
                    resolveAlldataServices();
                });

                describe('calendar', function () {
                    var $msg;
                    beforeEach(function () {
                        $msg = $('#date-range-ts-calendar span');
                    });

                    it('exists', function () {
                        expect($msg.length).toBe(1);
                    });

                    it('indicates the expected calendar', function () {
                        var msg = $msg.text();
                        expect(msg).toMatch('Fixed 365-day');
                    });
                });

                describe('time system', function () {
                    it('indicates the expected units-since', function () {
                        var msg = $('#date-range-ts').text();
                        expect(msg).toMatch(/days\s+since\s+1950-01-01/);
                    });

                    it('indicates the expected max date', function () {
                        var msg = $('#date-range-ts-max-date').text();
                        expect(msg).toMatch('2100-12-31');
                    });
                });

            });

            describe('user interaction', function () {
                var system;
                beforeEach(function () {
                    resolveAlldataServices();
                    var $startDate = $downloadForm.find('#from-date');
                    var startDate = $startDate.data('cfDate');
                    system = startDate.system;
                });

                // TODO: DRY up valid and invalid input tests
                describe('with valid inputs', function () {
                    each([
                        ['#from-date', 1980, 1, 1],
                        ['#from-date', 1990, 9, 30],
                        ['#to-date', 1980, 1, 1],
                        ['#to-date', 1990, 9, 30],
                    ]).describe(
                        '%s equals "%d-%d-%d"',
                        function (selector, year, month, day) {
                            var $date, dateString;
                            beforeEach(function () {
                                // Enter data in the input element
                                $date = $downloadForm.find(selector);
                                dateString = year + '/' + month + '/' + day;
                                $date.val(dateString);
                                $date.change();
                            });

                            it('sets cfDate as expected', function () {
                                var cfDate = $date.data('cfDate');
                                expect(cfDate).toEqual(
                                    calendars.CfDatetime.fromDatetime(
                                        system, year, month, day));
                            });

                            it('doesn\'t modify the input element', function () {
                                expect($date.val()).toBe(dateString);
                            });

                            it('shows no error message', function () {
                                var $error = $(selector + '-error-message');
                                expect($error.length).toBe(1);
                                expect($error.hasClass('inactive')).toBe(true);
                                var $errorMsg = $(selector + '-error-message span');
                                expect($errorMsg.length).toBe(1);
                                expect($errorMsg.text()).toMatch(/^\s*$/);
                            });

                            it('sets the download data link correctly', function () {
                                var $link = $('#download-timeseries');
                                var linkUrl = $link.attr('href');

                                var startDate = getDownloadCfDate('#from-date');
                                var endDate = getDownloadCfDate('#to-date');

                                expect(linkUrl).toMatch(RegExp(
                                    '\\?\\w+\\[' +
                                    startDate.toIndex() + ':' + endDate.toIndex() +
                                    '\\]'
                                ));
                            });

                        }
                    );
                });

                describe('with invalid inputs', function () {
                    each([
                        ['#from-date', 'foobar'],
                        ['#to-date', 'foobar'],
                    ]).describe(
                        '%s equals "%s"',
                        function (selector, dateString) {
                            var $date;
                            beforeEach(function () {
                                // Enter data in the input element
                                $date = $downloadForm.find(selector);
                                $date.val(dateString);
                                $date.change();
                                console.log('TTTTTTTTT $date.val()', $date.val())
                            });

                            it('sets cfDate as expected', function () {
                                var fallbackDate = selector === '#to-date' ?
                                    system.lastCfDatetime() :
                                    system.firstCfDatetime();
                                var cfDate = $date.data('cfDate');
                                expect(cfDate).toEqual(fallbackDate);
                            });

                            it('doesn\'t modify the input element', function () {
                                expect($date.val()).toBe(dateString);
                            });

                            it('shows an error message', function () {
                                var $error = $(selector + '-error-message');
                                expect($error.length).toBe(1);
                                var $errorMsg = $(selector + '-error-message span');
                                expect($errorMsg.length).toBe(1);
                                expect($error.hasClass('inactive')).toBe(false);
                                expect($errorMsg.text()).toMatch('not in acceptable date-time format');
                            });
                        }
                    );
                });
            });
        });

        describe('Download Full Timeseries checkbox', function () {
            it('exists', function () {
                var $checkbox = $downloadForm.find('#download-full-timeseries');
                expect($checkbox.length).toBeGreaterThan(0);
            });

            describe('sets start and end dates correctly when checked', function () {
                resolveAlldataServices();

                // We have to use a function to specify the value of
                // `expectedCfDate` because values set in beforeEach (here,
                // specifically, `$downloadForm`) are not defined outside of
                // a test body. So this variable must be evaluated in
                // the context of the test body. Which requires a function in
                // the `each`.
                each([
                    ['#from-date', function (system) { return system.firstCfDatetime(); }],
                    ['#to-date', function (system) { return system.lastCfDatetime(); }]
                ]).it('%s', function (selector, expectedCfDate) {
                    var $date = $downloadForm.find(selector);
                    var $checkbox = $downloadForm.find('#download-full-timeseries');

                    // Check the checkbox
                    $checkbox.attr('checked', true);
                    $checkbox.change();

                    var cfDate = $date.data('cfDate');

                    // Test input element state
                    expect($date.prop('disabled')).toBe(true);


                    // Test data associated with input element
                    expect(cfDate).toEqual(expectedCfDate(cfDate.system));

                    // Test input element content
                    expect($date.val()).toEqual(cfDate.toLooseString(true));

                    // Uncheck the checkbox
                    $checkbox.attr('checked', false);
                    $checkbox.change();

                    // And Test that the input element is re-enabled and
                    // retains the reset (all-time) date.
                    expect($date.prop('disabled')).toBe(false);
                    expect($date.data('cfDate')).toEqual(cfDate);
                    // Check input element content
                    expect($date.val()).toEqual(cfDate.toLooseString(true));
                });
            });
        });

    });

    describe('Data Download link', function () {
        var $link;
        beforeEach(function () {
            $link = $('#download-timeseries');
        });

        it('exists', function () {
            expect($link.length).toBeGreaterThan(0);
        });

        it('has the expected initial time range', function () {
            var linkUrl = $link.attr('href');

            var startDate = getDownloadCfDate('#from-date');
            var endDate = getDownloadCfDate('#to-date');

            expect(linkUrl).toMatch(RegExp(
                '\\?\\w+\\[' +
                startDate.toIndex() + ':' + endDate.toIndex() +
                '\\]'
            ));
        });

    });
});


//////////////////////////////////////////////////////////////////
describe('', function () {
    beforeEach(function () {
    });

    it('', function () {
    });
});
