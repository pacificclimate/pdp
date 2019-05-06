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
    { module: 'js/nodeExport', name: 'nodeExport' },
    { module: 'js/ie8.js' },  // execute only
    { module: 'js/jquery-1.10.2.js', name: ['$', 'jQuery'] },
    { module: 'js/jquery-ui-1.10.2.custom.js' }, // execute only
    { module: 'js/multiaccordion.js' },  // jQuery plugin
    { module: 'js/zebra.js' },  // execute only
    { include: 'js/OL/OpenLayers-2.13.1.debug.js' },
    { include: 'js/proj4js-compressed.js' },
    { module: 'js/lodash.core.js', name: ['_', 'lodash'] },
    { module: 'js/calendars.js' },
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
            '#from-date', fromDate && fromDate.toLooseDateFormat(),
            '#to-date', toDate && toDate.toLooseDateFormat()
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
            each([
                ['before data services resolve', function() {}],
                ['after data services resolve', resolveAlldataServices],
            ]).describe('%s', function (label, setup) {
                setup();

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
                    expect($date.val()).toEqual(cfDate.toLooseDateFormat());

                    // Uncheck the checkbox
                    $checkbox.attr('checked', false);
                    $checkbox.change();

                    // And Test that the input element is re-enabled and
                    // retains the reset (all-time) date.
                    expect($date.prop('disabled')).toBe(false);
                    expect($date.data('cfDate')).toEqual(cfDate);
                    // Check input element content
                    expect($date.val()).toEqual(cfDate.toLooseDateFormat());
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
