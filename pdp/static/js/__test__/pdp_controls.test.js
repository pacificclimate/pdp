require('./globals-helpers').importGlobals([
    { module: 'js/jquery-1.10.2.js', name: ['$', 'jQuery'] },
    { module: 'js/lodash.custom.js', name: ['_', 'lodash'] },
    { module: 'js/condExport.js', name: 'condExport' },
    { module: 'js/classes.js', name: 'classes' },
    { module: 'js/calendars.js', name: 'calendars' },
    { module: 'js/pdp_dom_library.js', spread: false },
    { module: 'js/pdp_controls.js', spread: true },
], '../..');


describe('Download links', () => {
    document.body.innerHTML =
      '<div>' +
      '   <a id="download-timeseries" href="#"/>' +
      '   <a id="download-metadata" href="#"/>' +
      '</div>';

    // Fake configuration of app.
    const base_url = 'http://base_url';
    const app_root = `${base_url}/app`;
    pdp.app_root = app_root;
    const data_root = `${base_url}/data`;
    pdp.data_root = data_root;

    const ncwmsLayer = {
        events: {
            register: function() {}
        }
    };

    const dataset_id = 'dataset_id';
    const variable_name = 'variable_name';
    const layer_id = `${dataset_id}/${variable_name}`;
    const extension = 'nc';
    const portal = 'portal';
    const filename = `filename`;
    const dataset_url = `${data_root}/${portal}/${filename}.${extension}`;
    const catalog = { [dataset_id]: dataset_url };

    describe('RasterDownloadLink', function() {
        const data_url = `${dataset_url}.${extension}?${variable_name}[t0:t1][y0:y1][x0:x1]&`;

        describe('mock app setup', function() {
            var dlLink;
            beforeEach(function() {
                dlLink = new RasterDownloadLink(
                  $('#download-timeseries'),
                  ncwmsLayer,
                  undefined,
                  extension,
                  variable_name,
                  't0:t1',
                  'y0:y1',
                  'x0:x1'
                );
              dlLink.catalog = catalog;
                dlLink.onLayerChange(layer_id);
            });

            afterEach(function() {
                dlLink = null;
            });

            it('has the supplied initial time range', function() {
                expect(dlLink.trange).toBe('t0:t1');
            });

            it('generates the expected download URL', function() {
                expect(dlLink.getUrl()).toBe(data_url);
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
                  const $download = $('#download-timeseries');
                  console.log("$download", $download)
                  console.log("$download.attr('id')", $download.attr('id'))
                  dlLink.register($('#download-timeseries'), function(node) {
                        console.log('registered fn: url', dlLink.getUrl())
                        console.log('registered fn: node', node)
                        console.log('registered fn: node.href', node.attr('href'))
                        node.attr('href', dlLink.getUrl());
                    }
                  );
                  dlLink.trigger();
                  expect($('#download-timeseries').attr('href')).toBe(data_url)
              }
            );
        });
    });

    describe('MetadataDownloadLink', function() {
        const metadata_url = `${data_root}/${portal}/${filename}.${extension}.das`;

        describe('mock app setup', function() {
            var dlLink;
            beforeEach(function() {
                dlLink = new MetadataDownloadLink(
                  $('#download-metadata'),
                  ncwmsLayer,
                  undefined,
                  extension,
                );
                dlLink.catalog = { [dataset_id]: dataset_url }
                dlLink.onLayerChange(layer_id);
                // dlLink.dl_url = 'test-dl-url'
            });

            afterEach(function() {
                dlLink = null;
            });

            it('generates the expected download URL', function() {
                expect(dlLink.getUrl()).toBe(metadata_url)
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
                  dlLink.register($('#download-metadata'), function(node) {
                        node.attr('href', dlLink.getUrl());
                    }
                  );
                  dlLink.trigger();
                  expect($('#download-metadata').attr('href'))
                    .toBe(metadata_url)
              }
            );
        });
    });
})



