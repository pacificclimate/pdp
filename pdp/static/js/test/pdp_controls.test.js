var $ = require('../jquery-1.10.2');

var pdp_controls = require('../pdp_controls');
var RasterDownloadLink = pdp_controls.RasterDownloadLink;


describe('RasterDownloadLink', function() {
    document.body.innerHTML =
        '<div>' +
            '<a id="download-timeseries" href="#"/>' +
        '</div>';

    var ncwmsLayer = {
        events: {
            register: function() {}
        }
    };

    describe('mock app setup', function() {
        var dlLink;
        beforeEach(function() {
            dlLink = new RasterDownloadLink(
                $('#download-timeseries'),
                ncwmsLayer,
                undefined,
                'nc',
                'tasmax',
                't0:t1',
                'y0:y1',
                'x0:x1'
            );
        });

        afterEach(function() {
            dlLink = null;
        });

        it('has the supplied initial time range', function() {
            expect(dlLink.trange).toBe('t0:t1');
        });

        it('generates the expected download URL', function() {
           expect(dlLink.getUrl()).toBe('.nc?tasmax[t0:t1][y0:y1][x0:x1]&')
        });

        it('calls back a registered function with supplied context', function() {
            var context = { foo: 'bar' };
            var callback = jest.fn();
            dlLink.register(context, callback);
            dlLink.trigger();
            expect(callback.mock.calls.length).toBe(1);
            expect(callback.mock.calls[0][0]).toBe(context);
        });

        it('produces the expected effect with code copied from canada_ex_app',
            function() {
                dlLink.register($('#download-timeseries'), function(node) {
                        node.attr('href', dlLink.getUrl());
                    }
                );
                dlLink.trigger();
                expect($('#download-timeseries').attr('href'))
                    .toEqual('.nc?tasmax[t0:t1][y0:y1][x0:x1]&')
            }
        );
    });
});