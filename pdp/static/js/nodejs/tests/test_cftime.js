/*jshint expr: true*/

'use strict';

var pdp = require('../pdp.js');

var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;

describe('cftime', function() {
    var t = new pdp.cftime('days', new Date('1950-01-01T08:00:00.000Z'));

    it('Should return a new cftime object', function() {
        var t = new pdp.cftime('days', new Date('1950-01-01T08:00:00.000Z'));
        expect(t).to.exist;
    });

    it('Should have setMaxTimeByIndex', function() {
        expect(t.setMaxTimeByIndex).to.exist;
    });
    describe('setMaxTimeByIndex()', function() {
        it('Should return Jan 31, 1950', function() {
            var t2 = t.setMaxTimeByIndex(30);
            expect(t2).to.equalDate(new Date('1950-01-31T08:00:00.000Z'));
        });
    });

    it('Should have toDate', function() {
        expect(t.toDate).to.exist;
    });
    describe('toDate()', function() {
        it('Should return Jan 31, 1950', function() {
            var t2 = t.toDate(20);
            expect(t2).to.equalDate(new Date('1950-01-21T08:00:00.000Z'));
        });
    });
    describe('toDate()', function() {
        it('Should return undefined', function() {
            var t2 = t.toDate(40);
            console.log(t2);
            expect(t2).to.be.undefined;
        });
    });

    it('Should have toIndex', function() {
        expect(t.toIndex).to.exist;
    });
    describe('toIndex()', function() {
        it('Should return 15', function() {
            var index = t.toIndex(new Date('1950-01-16T08:00:00.000Z'));
            expect(index).to.equal(15);
        });
    });
    describe('toIndex()', function() {
        it('Should return undefined', function() {
            var index = t.toIndex(new Date('1950-02-16T08:00:00.000Z'));
            expect(index).to.be.undefined;
        });
    });
});
