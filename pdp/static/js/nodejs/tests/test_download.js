/*jshint expr: true*/

"use strict";

var pdp = require("../pdp.js");

var chai = require("chai");
var expect = chai.expect;

describe("download", function() {
    describe("createFormatOptions()", function() {
        it("Should exist", function() {
            expect(pdp.download.createFormatOptions).to.exist;
        });
    });
    describe("createRasterFormatOptions()", function() {
        it("Should exist", function() {
            expect(pdp.download.createRasterFormatOptions).to.exist;
        });
    });
    describe("createMetadataFormatOptions()", function() {
        it("Should exist", function() {
            expect(pdp.download.createMetadataFormatOptions).to.exist;
        });
    });
    describe("createDownloadButtons()", function() {
        it("Should exist", function() {
            expect(pdp.download.createDownloadButtons).to.exist;
        });
    });
    describe("getCatalog()", function() {
        it("Should exist", function() {
            expect(pdp.download.getCatalog).to.exist;
        });
    });
});
