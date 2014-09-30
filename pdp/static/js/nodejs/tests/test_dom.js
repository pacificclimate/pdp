/*jshint expr: true*/

'use strict';

var pdp = require('../pdp.js');

var chai = require('chai');
var expect = chai.expect;

// var jsdom = require('jsdom').jsdom;
// var doc = jsdom('<html><head></head><body>hello world</body></html>');

describe('dom', function() {
    describe('curry()', function() {
        it('Should exist', function() {
            expect(pdp.dom.curry).to.exist;
        });
    });
    // describe('createInputElement()', function() {
    //     it('Should create an input element', function() {
    //         var ie = pdp.dom.createInputElement('text');
    //         var expected = doc.createElement('input');
    //         expected.type = 'text';
    //         expect(ie).to.equal(expected);
    //     });
    // });
});
