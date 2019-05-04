// This is only for testing, so only has to be a Node module

var convert = require('xml-js');

var mockHelpers = require('../test/mock-helpers');
var mock$AjaxResponse = mockHelpers.mock$AjaxResponse;

// Mocking presently only for tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada

// TODO: Move to mock-helpers
function makeGet(name, defaultData) {
    // Returns a get function which acts like `$.ajax()`, i.e. returns a
    // jQuery deferred.
    //
    // The user controls the deferred, which is attached to the function.
    //
    // Also attached to the function is a convenience function
    // `resolveWithDefault`, which resolves the deferred with the
    // `defaultData` argument to this maker function.

    var deferred = $.Deferred();

    function get() {
        return deferred;
    }
    get.name = name;

    get.deferred = deferred;

    get.resolveWithDefault = function () {
        console.log('## resolving', name);
        deferred.resolve(defaultData);
    };

    return get;
}


var catalog = {
    "tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada": "https://data.pacificclimate.org/data/downscaled_gcms/tasmax_day_BCCAQv2+ANUSPLIN300_CanESM2_historical+rcp26_r1i1p1_19500101-21001231.nc",
};
// function getCatalog() {
//     return mock$AjaxResponse(catalog);
// }
var getCatalog = makeGet('Catalog', catalog);


var metadata = {
    "units": "degC", "max": 46.4652, "min": -62.0813
};
// function getMetadata(layer_id) {
//     return mock$AjaxResponse(metadata);
// }
var getMetadata = makeGet('Metadata', metadata);


function getRasterAccordionMenuData(ensembleName) {
    return mock$AjaxResponse({
        "historical,rcp26": {
            "CanESM2": {
                "r1i1p1": {
                    "tasmax": "tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada",
                    "pr": "pr_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada",
                    "tasmin": "tasmin_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada"
                }
            }
        }
    });
}


// TODO: Feckin ell, can we cut this down?
// Maybe just to what the receiver cares about?
var ncwmsLayerCapablilitiesXml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    '<!DOCTYPE WMT_MS_Capabilities SYSTEM "http://schemas.opengis.net/wms/1.1.1/capabilities_1_1_1.dtd">\n' +
    '<WMT_MS_Capabilities\n' +
    '        version="1.1.1"\n' +
    '        updateSequence="2019-05-01T23:31:16.941Z"\n' +
    '        xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
    '    <!-- Service Metadata -->\n' +
    '    <Service>\n' +
    '        <!-- The WMT-defined name for this type of service -->\n' +
    '        <Name>OGC:WMS</Name>\n' +
    '        <!-- Human-readable title for pick lists -->\n' +
    '        <Title>My ncWMS server</Title>\n' +
    '        <!-- Narrative description providing additional information -->\n' +
    '        <Abstract> </Abstract>\n' +
    '        <KeywordList>\n' +
    '            \n' +
    '            \n' +
    '            <Keyword> </Keyword>\n' +
    '            \n' +
    '        </KeywordList>\n' +
    '        <!-- Top-level web address of service or service provider. See also OnlineResource\n' +
    '        elements under <DCPType>. -->\n' +
    '        <OnlineResource xlink:type="simple" xlink:href=" "/>\n' +
    '        <!-- Contact information -->\n' +
    '        <ContactInformation>\n' +
    '            <ContactPersonPrimary>\n' +
    '                <ContactPerson> </ContactPerson>\n' +
    '                <ContactOrganization> </ContactOrganization>\n' +
    '            </ContactPersonPrimary>\n' +
    '            <ContactVoiceTelephone> </ContactVoiceTelephone>\n' +
    '            <ContactElectronicMailAddress> </ContactElectronicMailAddress>\n' +
    '        </ContactInformation>\n' +
    '        <!-- Fees or access constraints imposed. -->\n' +
    '        <Fees>none</Fees>\n' +
    '        <AccessConstraints>none</AccessConstraints>\n' +
    '    </Service>\n' +
    '    <Capability>\n' +
    '        <Request>\n' +
    '            <GetCapabilities>\n' +
    '                <Format>application/vnd.ogc.wms_xml</Format>\n' +
    '                <DCPType>\n' +
    '                    <HTTP>\n' +
    '                        <Get>\n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms" />\n' +
    '                        </Get>\n' +
    '                    </HTTP>\n' +
    '                </DCPType>\n' +
    '            </GetCapabilities>\n' +
    '            <GetMap>\n' +
    '                \n' +
    '                <Format>image/png</Format>\n' +
    '                \n' +
    '                <Format>image/png;mode=32bit</Format>\n' +
    '                \n' +
    '                <Format>image/gif</Format>\n' +
    '                \n' +
    '                <Format>image/jpeg</Format>\n' +
    '                \n' +
    '                <Format>application/vnd.google-earth.kmz</Format>\n' +
    '                \n' +
    '                <DCPType>\n' +
    '                    <HTTP>\n' +
    '                        <Get>\n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms" />\n' +
    '                        </Get>\n' +
    '                    </HTTP>\n' +
    '                </DCPType>\n' +
    '            </GetMap>\n' +
    '            <GetFeatureInfo>\n' +
    '                \n' +
    '                <Format>image/png</Format>\n' +
    '                \n' +
    '                <Format>text/xml</Format>\n' +
    '                \n' +
    '                <DCPType>\n' +
    '                    <HTTP>\n' +
    '                        <Get>\n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms" />\n' +
    '                        </Get>\n' +
    '                    </HTTP>\n' +
    '                </DCPType>\n' +
    '            </GetFeatureInfo>\n' +
    '        </Request>\n' +
    '        <Exception>\n' +
    '            <Format>application/vnd.ogc.se_xml</Format>\n' +
    '            <!--<Format>application/vnd.ogc.se_inimage</Format>\n' +
    '            <Format>application/vnd.ogc.se_blank</Format>-->\n' +
    '        </Exception>\n' +
    '        \n' +
    '        <Layer>\n' +
    '            <Title>My ncWMS server</Title>\n' +
    '            \n' +
    '            <SRS>EPSG:4326</SRS>\n' +
    '            \n' +
    '            <SRS>CRS:84</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:41001</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:27700</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:3408</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:3409</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:3857</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:32661</SRS>\n' +
    '            \n' +
    '            <SRS>EPSG:32761</SRS>\n' +
    '            \n' +
    '            \n' +
    '            \n' +
    '            <Layer>\n' +
    '                <Title>tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada</Title>\n' +
    '                \n' +
    '                <Layer queryable="1">\n' +
    '                    <Name>tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax</Name>\n' +
    '                    <Title>air_temperature</Title>\n' +
    '                    <Abstract>Daily Maximum Near-Surface Air Temperature</Abstract>\n' +
    '                    \n' +
    '                    <LatLonBoundingBox minx="-140.99999666399998" maxx="-52.00000235999998" miny="41.000001336" maxy="83.49999861600001"/>\n' +
    '                    <BoundingBox SRS="EPSG:4326" minx="-140.99999666399998" maxx="-52.00000235999998" miny="41.000001336" maxy="83.49999861600001"/>\n' +
    '                    \n' +
    '                    <Dimension name="time" units="ISO8601"/>\n' +
    '                    \n' +
    '                    \n' +
    '                    \n' +
    '                    <Extent name="time" multipleValues="1" current="1" default="2019-05-01T12:00:00.000Z">\n' +
    '                        \n' +
    '                            \n' +
    '                            \n' +
    '                                \n' +
    '                                1950-01-01T12:00:00.000Z/1952-02-28T12:00:00.000Z/P1D,1952-03-01T12:00:00.000Z/1956-02-28T12:00:00.000Z/P1D,1956-03-01T12:00:00.000Z/1960-02-28T12:00:00.000Z/P1D,1960-03-01T12:00:00.000Z/1964-02-28T12:00:00.000Z/P1D,1964-03-01T12:00:00.000Z/1968-02-28T12:00:00.000Z/P1D,1968-03-01T12:00:00.000Z/1972-02-28T12:00:00.000Z/P1D,1972-03-01T12:00:00.000Z/1976-02-28T12:00:00.000Z/P1D,1976-03-01T12:00:00.000Z/1980-02-28T12:00:00.000Z/P1D,1980-03-01T12:00:00.000Z/1984-02-28T12:00:00.000Z/P1D,1984-03-01T12:00:00.000Z/1988-02-28T12:00:00.000Z/P1D,1988-03-01T12:00:00.000Z/1992-02-28T12:00:00.000Z/P1D,1992-03-01T12:00:00.000Z/1996-02-28T12:00:00.000Z/P1D,1996-03-01T12:00:00.000Z/2000-02-28T12:00:00.000Z/P1D,2000-03-01T12:00:00.000Z/2004-02-28T12:00:00.000Z/P1D,2004-03-01T12:00:00.000Z/2008-02-28T12:00:00.000Z/P1D,2008-03-01T12:00:00.000Z/2012-02-28T12:00:00.000Z/P1D,2012-03-01T12:00:00.000Z/2016-02-28T12:00:00.000Z/P1D,2016-03-01T12:00:00.000Z/2020-02-28T12:00:00.000Z/P1D,2020-03-01T12:00:00.000Z/2024-02-28T12:00:00.000Z/P1D,2024-03-01T12:00:00.000Z/2028-02-28T12:00:00.000Z/P1D,2028-03-01T12:00:00.000Z/2032-02-28T12:00:00.000Z/P1D,2032-03-01T12:00:00.000Z/2036-02-28T12:00:00.000Z/P1D,2036-03-01T12:00:00.000Z/2040-02-28T12:00:00.000Z/P1D,2040-03-01T12:00:00.000Z/2044-02-28T12:00:00.000Z/P1D,2044-03-01T12:00:00.000Z/2048-02-28T12:00:00.000Z/P1D,2048-03-01T12:00:00.000Z/2052-02-28T12:00:00.000Z/P1D,2052-03-01T12:00:00.000Z/2056-02-28T12:00:00.000Z/P1D,2056-03-01T12:00:00.000Z/2060-02-28T12:00:00.000Z/P1D,2060-03-01T12:00:00.000Z/2064-02-28T12:00:00.000Z/P1D,2064-03-01T12:00:00.000Z/2068-02-28T12:00:00.000Z/P1D,2068-03-01T12:00:00.000Z/2072-02-28T12:00:00.000Z/P1D,2072-03-01T12:00:00.000Z/2076-02-28T12:00:00.000Z/P1D,2076-03-01T12:00:00.000Z/2080-02-28T12:00:00.000Z/P1D,2080-03-01T12:00:00.000Z/2084-02-28T12:00:00.000Z/P1D,2084-03-01T12:00:00.000Z/2088-02-28T12:00:00.000Z/P1D,2088-03-01T12:00:00.000Z/2092-02-28T12:00:00.000Z/P1D,2092-03-01T12:00:00.000Z/2096-02-28T12:00:00.000Z/P1D,2096-03-01T12:00:00.000Z/2100-12-31T12:00:00.000Z/P1D\n' +
    '                            \n' +
    '                        \n' +
    '                    </Extent>\n' +
    '                    \n' +
    '                    \n' +
    '                    \n' +
    '                    \n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/alg</Name>\n' +
    '                        <Title>boxfill/alg</Title>\n' +
    '                        <Abstract>boxfill style, using the alg palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=alg"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/greyscale</Name>\n' +
    '                        <Title>boxfill/greyscale</Title>\n' +
    '                        <Abstract>boxfill style, using the greyscale palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=greyscale"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/ncview</Name>\n' +
    '                        <Title>boxfill/ncview</Title>\n' +
    '                        <Abstract>boxfill style, using the ncview palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=ncview"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/occam</Name>\n' +
    '                        <Title>boxfill/occam</Title>\n' +
    '                        <Abstract>boxfill style, using the occam palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=occam"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/yellow_red</Name>\n' +
    '                        <Title>boxfill/yellow_red</Title>\n' +
    '                        <Abstract>boxfill style, using the yellow_red palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=yellow_red"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/blue7_red3</Name>\n' +
    '                        <Title>boxfill/blue7_red3</Title>\n' +
    '                        <Abstract>boxfill style, using the blue7_red3 palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=blue7_red3"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/red_yellow</Name>\n' +
    '                        <Title>boxfill/red_yellow</Title>\n' +
    '                        <Abstract>boxfill style, using the red_yellow palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=red_yellow"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/lightblue_darkblue_log</Name>\n' +
    '                        <Title>boxfill/lightblue_darkblue_log</Title>\n' +
    '                        <Abstract>boxfill style, using the lightblue_darkblue_log palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=lightblue_darkblue_log"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/occam_inv</Name>\n' +
    '                        <Title>boxfill/occam_inv</Title>\n' +
    '                        <Abstract>boxfill style, using the occam_inv palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=occam_inv"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/sst_36</Name>\n' +
    '                        <Title>boxfill/sst_36</Title>\n' +
    '                        <Abstract>boxfill style, using the sst_36 palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=sst_36"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/ferret</Name>\n' +
    '                        <Title>boxfill/ferret</Title>\n' +
    '                        <Abstract>boxfill style, using the ferret palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=ferret"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/occam_pastel-30</Name>\n' +
    '                        <Title>boxfill/occam_pastel-30</Title>\n' +
    '                        <Abstract>boxfill style, using the occam_pastel-30 palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=occam_pastel-30"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/redblue</Name>\n' +
    '                        <Title>boxfill/redblue</Title>\n' +
    '                        <Abstract>boxfill style, using the redblue palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=redblue"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/brown_green</Name>\n' +
    '                        <Title>boxfill/brown_green</Title>\n' +
    '                        <Abstract>boxfill style, using the brown_green palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=brown_green"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/blueheat</Name>\n' +
    '                        <Title>boxfill/blueheat</Title>\n' +
    '                        <Abstract>boxfill style, using the blueheat palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=blueheat"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/blue4_red6</Name>\n' +
    '                        <Title>boxfill/blue4_red6</Title>\n' +
    '                        <Abstract>boxfill style, using the blue4_red6 palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=blue4_red6"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/alg2</Name>\n' +
    '                        <Title>boxfill/alg2</Title>\n' +
    '                        <Abstract>boxfill style, using the alg2 palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=alg2"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/lightblue_darkblue_log_nc</Name>\n' +
    '                        <Title>boxfill/lightblue_darkblue_log_nc</Title>\n' +
    '                        <Abstract>boxfill style, using the lightblue_darkblue_log_nc palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=lightblue_darkblue_log_nc"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/brown_blue</Name>\n' +
    '                        <Title>boxfill/brown_blue</Title>\n' +
    '                        <Abstract>boxfill style, using the brown_blue palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=brown_blue"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/blue6_red4</Name>\n' +
    '                        <Title>boxfill/blue6_red4</Title>\n' +
    '                        <Abstract>boxfill style, using the blue6_red4 palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=blue6_red4"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/blue_brown</Name>\n' +
    '                        <Title>boxfill/blue_brown</Title>\n' +
    '                        <Abstract>boxfill style, using the blue_brown palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=blue_brown"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/blue_darkred</Name>\n' +
    '                        <Title>boxfill/blue_darkred</Title>\n' +
    '                        <Abstract>boxfill style, using the blue_darkred palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=blue_darkred"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/lightblue_darkblue</Name>\n' +
    '                        <Title>boxfill/lightblue_darkblue</Title>\n' +
    '                        <Abstract>boxfill style, using the lightblue_darkblue palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=lightblue_darkblue"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    <Style>\n' +
    '                      <Name>boxfill/rainbow</Name>\n' +
    '                        <Title>boxfill/rainbow</Title>\n' +
    '                        <Abstract>boxfill style, using the rainbow palette </Abstract>\n' +
    '                        <LegendURL width="110" height="264"> \n' +
    '                            <Format>image/png</Format> \n' +
    '                            <OnlineResource xlink:type="simple" xlink:href="http://pizza.pcic.uvic.ca:8080/ncWMS-PCIC/wms?REQUEST=GetLegendGraphic&amp;LAYER=tasmax_day_BCCAQv2_CanESM2_historical-rcp26_r1i1p1_19500101-21001231_Canada/tasmax&amp;PALETTE=rainbow"/>\n' +
    '                        </LegendURL>\n' +
    '                    </Style>\n' +
    '                    \n' +
    '                    \n' +
    '                </Layer>\n' +
    '                 \n' +
    '            </Layer>\n' +
    '            \n' +
    '            \n' +
    '        </Layer>\n' +
    '    </Capability>\n' +
    '</WMT_MS_Capabilities>';
var ncwmsLayerCapabilities = convert.xml2js(ncwmsLayerCapablilitiesXml);

// function getNCWMSLayerCapabilities(ncwms_layer) {
//     return mock$AjaxResponse(ncwmsLayerCapabilities);
// }
var getNCWMSLayerCapabilities = makeGet('NCWMSLayerCapabilities', ncwmsLayerCapabilities);


var ncwmsLayerDDS = ['Dataset {\n' +
'    Float64 time[time = 55115];\n' +
'} tasmax_day_BCCAQv2%2BANUSPLIN300_CanESM2_historical%2Brcp26_r1i1p1_19500101-21001231%2Enc;\n'];

// function getNcwmsLayerDDS(layerUrl) {
//     return mock$AjaxResponse(ncwmsLayerDDS);
// }
var getNcwmsLayerDDS = makeGet('NcwmsLayerDDS', ncwmsLayerDDS);


var ncwmsLayerDAS = ['Attributes {\n' +
'    NC_GLOBAL {\n' +
'        String domain "Canada";\n' +
'        String method_id "BCCAQv2";\n' +
'        String product "downscaled output";\n' +
'        String creation_date "2017-05-18T15:42:22PDT";\n' +
'        String GCM__experiment_id "historical,rcp26";\n' +
'        String frequency "day";\n' +
'        String references "Alex J. Cannon, Stephen R. Sobie, and Trevor Q. Murdock, 2015: Bias Correction of GCM Precipitation by Quantile Mapping: How Well Do Methods Preserve Changes in Quantiles and Extremes?. J. Climate, 28, 6938–6959.";\n' +
'        String GCM__institute_id "CCCma";\n' +
'        String target__dataset_id "ANUSPLIN300";\n' +
'        String target__contact "Pia Papadopol (pia.papadopol@nrcan-rncan.gc.ca)";\n' +
'        String target__institute_id "CFS-NRCan";\n' +
'        String title "Bias Correction/Constructed Analogue Quantile Mapping version 2.0 (BCCAQ2) downscaling model output for Canada";\n' +
'        String contact "Pacific Climate Impacts Consortium";\n' +
'        String GCM__experiment "historical,rcp26";\n' +
'        String package_id "github.com/pacificclimate/ClimDown";\n' +
'        String project_id "CMIP5";\n' +
'        String method "Quantile Delta Mapping";\n' +
'        String institute_id "PCIC";\n' +
'        String GCM__physics_version "1";\n' +
'        String target__institution "Canadian Forest Service, Natural Resources Canada";\n' +
'        String target__references "McKenney, D.W., Hutchinson, M.F., Papadopol, P., Lawrence, K., Pedlar, J.,\n' +
'Campbell, K., Milewska, E., Hopkinson, R., Price, D., and Owen, T.,\n' +
'2011. Customized spatial climate models for North America.\n' +
'Bulletin of the American Meteorological Society, 92(12): 1611-1622.\n' +
'\n' +
'Hopkinson, R.F., McKenney, D.W., Milewska, E.J., Hutchinson, M.F.,\n' +
'Papadopol, P., Vincent, L.A., 2011. Impact of aligning climatological day\n' +
'on gridding daily maximum-minimum temperature and precipitation over Canada.\n' +
'Journal of Applied Meteorology and Climatology 50: 1654-1665.";\n' +
'        String target__version "obtained: 2 April 2012, 14 June 2012, and 30 January 2013";\n' +
'        String institution "Pacific Climate Impacts Consortium (PCIC), Victoria, BC, www.pacificclimate.org";\n' +
'        String GCM__initialization_method "1";\n' +
'        String GCM__institution "CCCma (Canadian Centre for Climate Modelling and Analysis, Victoria, BC, Canada)";\n' +
'        String Conventions "CF-1.4";\n' +
'        String modeling_realm "atmos";\n' +
'        String table_id "Table day (10 Jun 2010)";\n' +
'        String NCO "\\"4.6.0\\"";\n' +
'        String target__dataset "ANUSPLIN interpolated Canada daily 300 arc second climate grids";\n' +
'        String history "Thu Dec 20 15:49:20 2018: remove_time_offset tasmax_day_BCCAQv2+ANUSPLIN300_CanESM2_historical+rcp26_r1i1p1_19500101-21001231.nc  ";\n' +
'        String GCM__model_id "CanESM2";\n' +
'        String GCM__realization "1";\n' +
'    }\n' +
'    lon {\n' +
'        String long_name "longitude";\n' +
'        String standard_name "longitude";\n' +
'        String NAME "lon";\n' +
'        String units "degrees_east";\n' +
'        Int32 _Netcdf4Dimid 0;\n' +
'        String CLASS "DIMENSION_SCALE";\n' +
'        String axis "X";\n' +
'    }\n' +
'    lat {\n' +
'        String long_name "latitude";\n' +
'        String standard_name "latitude";\n' +
'        String NAME "lat";\n' +
'        String units "degrees_north";\n' +
'        Int32 _Netcdf4Dimid 1;\n' +
'        String CLASS "DIMENSION_SCALE";\n' +
'        String axis "Y";\n' +
'    }\n' +
'    time {\n' +
'        String long_name "Time";\n' +
'        String standard_name "Time";\n' +
'        String NAME "time";\n' +
'        String units "days since 1950-01-01";\n' +
'        Int32 _Netcdf4Dimid 2;\n' +
'        String calendar "365_day";\n' +
'        String CLASS "DIMENSION_SCALE";\n' +
'    }\n' +
'    tasmax {\n' +
'        Int16 _FillValue 32767;\n' +
'        Float64 scale_factor 0.0030518;\n' +
'        Float64 add_offset 0.0015259;\n' +
'        String long_name "Daily Maximum Near-Surface Air Temperature";\n' +
'        String standard_name "air_temperature";\n' +
'        String cell_methods "time: maximum";\n' +
'        String units "degC";\n' +
'        Float64 missing_value 32767;\n' +
'    }\n' +
'}'];
// function getNcwmsLayerDAS(layerUrl) {
//     return mock$AjaxResponse(ncwmsLayerDAS);
// }
var getNcwmsLayerDAS = makeGet('NcwmsLayerDAS', ncwmsLayerDAS);

module.exports = {
    getCatalog: getCatalog,
    getMetadata: getMetadata,
    getRasterAccordionMenuData: getRasterAccordionMenuData,
    getNCWMSLayerCapabilities: getNCWMSLayerCapabilities,
    getNcwmsLayerDDS: getNcwmsLayerDDS,
    getNcwmsLayerDAS: getNcwmsLayerDAS,
};


