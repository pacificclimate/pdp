// Mock data-services module for testing hydro_station_app.
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


var getStationCount = mockHelpers.unexpectedRequest({
    name: 'getStationCount', log: true, throw: true,
});


var getRecordLength = mockHelpers.unexpectedRequest({
    name: 'getRecordLength', log: true, throw: true,
});

var routedFlowMetadata = [
    'Network,SiteID,StationName,VICID,FlowRegime,MajorBasin,Province,Latitude,Longitude,DrainageArea,WSCDrainageArea,Reg,RHBN,VICLat,VICLon,FileName',
    'BCH,BCH SCA,CAMPBELL RIVER AT STRATHCONA DAM,BCSCA,Regulated,Campbell,BC,50,-125.58,1193,1193, True, False,49.96875,-125.59375,BCHSCA_Campbell.csv',
    'WSC,08NA006, KICKING HORSE RIVER AT GOLDEN,KICAG,Natural,Columbia,BC,51.3,-116.9681,1850,1850, False, False,51.28125,-116.90625,08NA006_Columbia.csv',
].join('\n');
var getRoutedFlowMetadata =
    makeMockGet('RoutedFlowMetadata', routedFlowMetadata, true);


module.exports = {
    getCatalog: getCatalog,
    getMetadata: getMetadata,
    getRasterAccordionMenuData: getRasterAccordionMenuData,
    getNCWMSLayerCapabilities: getNCWMSLayerCapabilities,
    getNcwmsLayerDDS: getNcwmsLayerDDS,
    getNcwmsLayerDAS: getNcwmsLayerDAS,
    getStationCount: getStationCount,
    getRecordLength: getRecordLength,
    getRoutedFlowMetadata: getRoutedFlowMetadata,
};


