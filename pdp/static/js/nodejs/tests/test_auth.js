/*jshint expr: true*/

'use strict';

var pdp = require('../pdp.js');

var chai = require('chai');
var expect = chai.expect;

describe('auth', function() {
    describe('init_login()', function() {
        it('Should exist', function() {
            expect(pdp.auth.init_login).to.exist;
        });
    });
    describe('checkLogin()', function() {
        it('Should exist', function() {
            expect(pdp.auth.checkLogin).to.exist;
        });
    });
});
