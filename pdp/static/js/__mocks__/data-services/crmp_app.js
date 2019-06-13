// Mock data-services module for testing crmp_app.
// For tests only, so is a pure Node module.
// Note this does not follow the arrangement for
// [Jest module "manual mocks"] (https://jestjs.io/docs/en/manual-mocks).

var convert = require('xml-js');

var mockHelpers = require('../../__test__/mock-helpers');
var makeMockGet = mockHelpers.makeMockGet;


var getCatalog =  mockHelpers.unexpectedRequest({
    name: 'getCatalog', log: true, throw: true,
});


var getMetadata = mockHelpers.unexpectedRequest({
    name: 'getMetadata', log: true, throw: true,
});


var getRasterAccordionMenuData = mockHelpers.unexpectedRequest({
    name: 'getRasterAccordionMenuData', log: true, throw: true,
});


var getNCWMSLayerCapabilities = mockHelpers.unexpectedRequest({
    name: 'getNCWMSLayerCapabilities', log: true, throw: true,
});


var getNcwmsLayerDDS = mockHelpers.unexpectedRequest({
    name: 'getNcwmsLayerDDS', log: true, throw: true,
});


var getNcwmsLayerDAS = mockHelpers.unexpectedRequest({
    name: 'getNcwmsLayerDAS', log: true, throw: true,
});


var stationCount = { stations_selected: 1000 };
var getStationCount = makeMockGet('StationCount', stationCount, true);


var recordLength = { climo_length: 1001, record_length: 1002 };
var getRecordLength = makeMockGet('RecordLength', recordLength, true);


module.exports = {
    getCatalog: getCatalog,
    getMetadata: getMetadata,
    getRasterAccordionMenuData: getRasterAccordionMenuData,
    getNCWMSLayerCapabilities: getNCWMSLayerCapabilities,
    getNcwmsLayerDDS: getNcwmsLayerDDS,
    getNcwmsLayerDAS: getNcwmsLayerDAS,
    getStationCount: getStationCount,
    getRecordLength: getRecordLength,
};


