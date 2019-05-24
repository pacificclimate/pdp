var each = require('jest-each').default;

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

function resetAllDataServices() {
    dataServices.getMetadata.reset();
    dataServices.getCatalog.reset();
    dataServices.getNCWMSLayerCapabilities.reset();
    dataServices.getNcwmsLayerDDS.reset();
    dataServices.getNcwmsLayerDAS.reset();
}

function dateFilterTests(
    app, config
) {
    describe('app', function () {
        beforeEach(function () {
            // Reset the DOM (jsdom)
            document.body.innerHTML =
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
            resetAllDataServices();
            app();
        });

        afterEach(function () {
            // Is this necessary?
            document.body.innerHTML = '';
        });

        function getDownloadCfDate(selector) {
            var $downloadForm = $('#download-form');
            var $date = $downloadForm.find(selector);
            return $date.data('cfDate');
        }

        describe('Download form', function () {
            var $downloadForm;

            beforeEach(function () {
                $downloadForm = $('#download-form');
            });

            describe('date inputs', function () {
                describe('initial values', function () {
                    each([
                        ['before', function() {}],
                        ['after', resolveAlldataServices],
                    ]).describe('%s data services resolve', function (phase, action) {
                        beforeEach(function () {
                            action();
                        });

                        each([
                            ['#from-date', config.defaultStartDate[phase]],
                            ['#to-date', config.defaultEndDate[phase]],
                        ]).describe('%s', function (selector, expectedCfDate) {

                            it('has expected element content', function () {
                                var $date = $downloadForm.find(selector);
                                expect($date.val())
                                    .toMatch(expectedCfDate.toLooseString(true));
                            });

                            it('has expected attached cfDate', function () {
                                var $date = $downloadForm.find(selector);
                                var cfDate = $date.data('cfDate');
                                expect(cfDate).toBeDefined();
                                expect(cfDate).toEqual(expectedCfDate)
                            });
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
                                    var $errorMsg = $(selector + '-error-message .value');
                                    expect($errorMsg.length).toBe(1);
                                    expect($errorMsg.text()).toMatch(/^\s*$/);
                                });

                                if (!config.omitsDownloadDataLink) {
                                    it('sets the download data link correctly', function () {
                                        if (!config.hasDownloadDataLink) return;

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
                                    var $errorMsg = $(selector + '-error-message .value');
                                    expect($errorMsg.length).toBe(1);
                                    expect($error.hasClass('inactive')).toBe(false);
                                    expect($errorMsg.text()).toMatch('not in acceptable date-time format');
                                });
                            }
                        );
                    });
                });
            });

            describe('annotations', function () {
                beforeEach(function () {
                    resolveAlldataServices();
                });

                describe('calendar', function () {
                    var $msg;
                    beforeEach(function () {
                        $msg = $('#date-range-calendar .value');
                    });

                    it('exists', function () {
                        expect($msg.length).toBe(1);
                    });

                    it('indicates the expected calendar', function () {
                        var msg = $msg.text();
                        expect(msg).toMatch(
                            config.defaultCfTimeSystem.startDate.calendar.name
                        );  // FFFFFFUUUUUU
                    });
                });

                describe('time system', function () {
                    it('indicates the expected units-since', function () {
                        var msg = $('#date-range-ts').text();
                        var ts = config.defaultCfTimeSystem;
                        expect(msg).toMatch(new RegExp(
                            ts.units + '\\s+since\\s+' +
                            ts.startDate.toISOString(true)
                        ));
                        // expect(msg).toMatch(/days\s+since\s+1950-01-01/);
                    });

                    it('indicates the expected max date', function () {
                        var msg = $('#date-range-ts-max-date').text();
                        expect(msg).toMatch('2100-12-31');
                    });
                });

            });

            if (!config.omitsloadFullTimeSeriesCheckbox) {
                describe('Download Full Timeseries checkbox', function () {
                    it('exists', function () {
                        var $checkbox = $downloadForm.find('#download-full-timeseries');
                        expect($checkbox.length).toBeGreaterThan(0);
                    });

                    describe('sets inputs correctly when checked', function () {
                        beforeEach(function () {
                            resolveAlldataServices();
                        });

                        // We have to use a function to specify the value of
                        // `expectedCfDate` because values set in beforeEach (here,
                        // specifically, `$downloadForm`) are not defined outside of
                        // a test body. So this variable must be evaluated in
                        // the context of the test body. Which requires a function in
                        // the `each`.
                        each([
                            ['#from-date', function (system) {
                                return system.firstCfDatetime();
                            }],
                            ['#to-date', function (system) {
                                return system.lastCfDatetime();
                            }]
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
            }

        });

        if (!config.omitsDownloadDataLink) {
            describe('Data Download link', function () {
                var $link;
                beforeEach(function () {
                    resolveAlldataServices();
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
        }
    });
}


module.exports = dateFilterTests;
