/*jshint expr: true*/

"use strict";

var pdp = require("../pdp.js");

var chai = require("chai");
var expect = chai.expect;

describe("vector", function() {
    describe("generateGetFeatureInfoParams()", function() {
        it("Should exist", function() {
            expect(pdp.vector.generateGetFeatureInfoParams).to.exist;
        });
    });
    describe("getLoadingPopup()", function() {
        it("Should exist", function() {
            expect(pdp.vector.getLoadingPopup).to.exist;
        });
    });
});
