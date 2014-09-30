/*jshint expr: true*/

"use strict";

var pdp = require("../pdp.js");

var chai = require("chai");
var expect = chai.expect;

describe("map", function() {
    describe("getBC3005Bounds()", function() {
        it("Should exist", function() {
            expect(pdp.map.getBC3005Bounds).to.exist;
        });
    });
    describe("getBC3005Bounds_vic()", function() {
        it("Should exist", function() {
            expect(pdp.map.getBC3005Bounds_vic).to.exist;
        });
    });
    describe("BC3005_map_options()", function() {
        it("Should exist", function() {
            expect(pdp.map.BC3005_map_options).to.exist;
        });
    });
    describe("BC3005_map_options_vic()", function() {
        it("Should exist", function() {
            expect(pdp.map.BC3005_map_options_vic).to.exist;
        });
    });
    describe("na4326_map_options()", function() {
        it("Should exist", function() {
            expect(pdp.map.na4326_map_options).to.exist;
        });
    });
    describe("getGSBaseLayer()", function() {
        it("Should exist", function() {
            expect(pdp.map.getGSBaseLayer).to.exist;
        });
    });
    describe("getNaBaseLayer()", function() {
        it("Should exist", function() {
            expect(pdp.map.getNaBaseLayer).to.exist;
        });
    });
    describe("getBC3005OsmBaseLayer()", function() {
        it("Should exist", function() {
            expect(pdp.map.getBC3005OsmBaseLayer).to.exist;
        });
    });
    describe("getBasicControls()", function() {
        it("Should exist", function() {
            expect(pdp.map.getBasicControls).to.exist;
        });
    });
    describe("getEditingToolbar()", function() {
        it("Should exist", function() {
            expect(pdp.map.getEditingToolbar).to.exist;
        });
    });
    describe("getHandNav()", function() {
        it("Should exist", function() {
            expect(pdp.map.getHandNav).to.exist;
        });
    });
    describe("getPolygonLayer()", function() {
        it("Should exist", function() {
            expect(pdp.map.getPolygonLayer).to.exist;
        });
    });
    describe("getBoxLayer()", function() {
        it("Should exist", function() {
            expect(pdp.map.getBoxLayer).to.exist;
        });
    });
    describe("getPolyEditor()", function() {
        it("Should exist", function() {
            expect(pdp.map.getPolyEditor).to.exist;
        });
    });
    describe("getOpacitySlider()", function() {
        it("Should exist", function() {
            expect(pdp.map.getOpacitySlider).to.exist;
        });
    });
    describe("addLoadingIcon()", function() {
        it("Should exist", function() {
            expect(pdp.map.addLoadingIcon).to.exist;
        });
    });
});
