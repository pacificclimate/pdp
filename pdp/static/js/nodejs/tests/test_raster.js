/*jshint expr: true*/

"use strict";

var pdp = require("../pdp.js");

var chai = require("chai");
var expect = chai.expect;

describe("raster", function() {
    describe("ddsToTimeIndex()", function() {
        it("Should exist", function() {
            expect(pdp.raster.ddsToTimeIndex).to.exist;
        });
    });
    describe("getNCWMSLayerCapabilities()", function() {
        it("Should exist", function() {
            expect(pdp.raster.getNCWMSLayerCapabilities).to.exist;
        });
    });
    describe("setTimeAvailable()", function() {
        it("Should exist", function() {
            expect(pdp.raster.setTimeAvailable).to.exist;
        });
    });
    describe("processNcwmsLayerMetadata()", function() {
        it("Should exist", function() {
            expect(pdp.raster.processNcwmsLayerMetadata).to.exist;
        });
    });
    describe("intersection()", function() {
        it("Should exist", function() {
            expect(pdp.raster.intersection).to.exist;
        });
    });
    describe("getRasterNativeProj()", function() {
        it("Should exist", function() {
            expect(pdp.raster.getRasterNativeProj).to.exist;
        });
    });
    describe("getRasterBbox()", function() {
        it("Should exist", function() {
            expect(pdp.raster.getRasterBbox).to.exist;
        });
    });
    describe("getTimeSelected()", function() {
        it("Should exist", function() {
            expect(pdp.raster.getTimeSelected).to.exist;
        });
    });
    describe("rasterBBoxToIndicies()", function() {
        it("Should exist", function() {
            expect(pdp.raster.rasterBBoxToIndicies).to.exist;
        });
    }); 
});
