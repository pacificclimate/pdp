/*jshint expr: true*/

"use strict";

var pdp = require("../pdp.js");

var chai = require("chai");
var expect = chai.expect;

describe("controls", function() {
    describe("getDateRange()", function() {
        it("Should exist", function() {
            expect(pdp.controls.getDateRange).to.exist;
        });
    });
    describe("getRasterAccordionMenu()", function() {
        it("Should exist", function() {
            expect(pdp.controls.getRasterAccordionMenu).to.exist;
        });
    });
    describe("getRasterControls()", function() {
        it("Should exist", function() {
            expect(pdp.controls.getRasterControls).to.exist;
        });
    });
    describe("getRasterDownloadOptions()", function() {
        it("Should exist", function() {
            expect(pdp.controls.getRasterDownloadOptions).to.exist;
        });
    });
});
