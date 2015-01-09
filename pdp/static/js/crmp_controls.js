/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, varChange, CRMPFilterChange, netChange, freqChange, hasClimaChange, filter_clear, dateChange, getDateRange*/
"use strict";

function createVariableOptions(map) {
    var variableData, varSel;
    variableData = { '': pdp.mkOpt('All'),
                         lwe_thickness_of_precipitation_amount_sum: pdp.mkOpt('Precipitation Amount', 'Precipitation amount is the total of precipitation over an observational period regardless of precipitation type. Where snowfall occurs, this is intended to be the total water equivalent precipitation amount.'),
                         air_temperature_mean: pdp.mkOpt('Temperature (Mean)', 'Mean temperature refers to the average of temperature measurements taken at a measurement frequency greater or equal to that of the native data frequency. Generally, temperature measurements are taken at 1.5 m to 2 m above ground level. However, for many networks, this height changes as snow levels rise in winter. Often, precise indications of actual sensor height are not availble.'),
                         Temperature: pdp.mkOptGroup({ air_temperature_minimum: pdp.mkOpt('Temperature (Min.)', 'Minimum temperature is the minimum temperature value observed during the observation interval.'),
                                                       air_temperature_maximum: pdp.mkOpt('Temperature (Max.)', 'Maximum temperature is the minimum temperature value observed during the observation interval.'),
                                                       air_temperature_point: pdp.mkOpt('Temperature (Point)', 'Temperature measured instantaneosly at the observation time.'),
                                                       'air_temperaturet: mean within days t: mean within months t: mean over years': pdp.mkOpt('Temperature Climatology (Mean)', 'This is the climatological average for mean daily air temperature averaged for all days in a month and for all years for a given month.'),
                                                       'air_temperaturet: minimum within days t: mean within months t: mean over years': pdp.mkOpt('Temperature Climatology (Min.)', 'This is the climatological average for minimum daily air temperature averaged for all days in a month and for all years for a given month.'),
                                                       'air_temperaturet: maximum within days t: mean within months t: mean over years': pdp.mkOpt('Temperature Climatology (Max.)', 'This is the climatological average for maximum daily air temperature averaged for all days in a month and for all years for a given month.') }),
                         Precipitation: pdp.mkOptGroup({ 'lwe_thickness_of_precipitation_amountt: sum within months t: mean over years': pdp.mkOpt('Precipitation Climatology', 'This is the climatological average for monthly total precipitation averaged across all years for a given month.'),
                                                         'lwe_thickness_of_precipitation_sum': pdp.mkOpt('Precipitation (Cumulative)', 'Precipitation accumulated in an instrument gauge between manual or automatic purging of the gauge. Such guages are often installed in locations where opportunities to empty the gauge are rare. Because of this, cumulative precipitation amounts are subject to inaccuracies due to evaporation, snow capping or other precipitation loss.'),
                                                         thickness_of_rainfall_amount: pdp.mkOpt('Rainfall Amount', 'Liquid precipitation accumulated over the observational period defined by the observational frequency.'),
                                                         thickness_of_snowfall_amount: pdp.mkOpt('Snowfall Amount', 'Solid precipitation accumulated over the observational period defined by the observational frequency.'),
                                                         surface_snow_thickness_point: pdp.mkOpt('Surface Snow Depth', 'Depth of snow on the ground at the time of observation.') }),
                         Humidity: pdp.mkOptGroup({ relative_humidity_mean: pdp.mkOpt('Relative Humidity (Mean)', 'The percent saturation of the atmosphere with respect to water vapor averaged across all measurements taken over the observational period as defined by the observational frequency.'),
                                                    relative_humidity_minimum: pdp.mkOpt('Relative Humidity (Min.)', 'The percent saturation of the atmosphere with respect to water vapor as a minimum across all measurements taken over the observational period as defined by the observational frequency.'),
                                                    relative_humidity_maximum: pdp.mkOpt('Relative Humidity (Max.)', 'The percent saturation of the atmosphere with respect to water vapor as a maximum across all measurements taken over the observational period as defined by the observational frequency.'),
                                                    relative_humidity_point: pdp.mkOpt('Relative Humidity (Point)', 'The instantaneous percent saturation of the atmosphere with respect to water vapor at the observation time.'),
                                                    dew_point_temperature_point: pdp.mkOpt('Dew Point Temperature (Point)', 'The instantaneous temperature, for a given atmospheric water vapor content, at which an airmass becomes saturated with respect to water vapor and condensation may occur.'),
                                                    dew_point_temperature_mean: pdp.mkOpt('Dew Point Temperature (Mean)', 'The temperature, for a given atmospheric water vapor content, at which an airmass becomes saturated with respect to water vapor and condensation may occur. Averaged across all measurements taken over the observational period as defined by the observational frequency.') }),
                         Wind: pdp.mkOptGroup({ 'wind_speed_mean': pdp.mkOpt('Wind Speed (Mean)', 'Scalar speed of wind averaged over all measurements taken over the observational period as defined by the observational frequency.'),
                                                'wind_speed_minimum': pdp.mkOpt('Wind Speed (Min.)', 'Minimum scalar speed of wind observed from all measurements taken over the observational period as defined by the observational frequency.'),
                                                'wind_speed_maximum': pdp.mkOpt('Wind Speed (Max.)', 'Maximum scalar speed of wind observed from all measurements taken over the observational period as defined by the observational frequency.'),
                                                'wind_speed_point': pdp.mkOpt('Wind Speed (Point)', 'The instantaneous scalar speed of wind observed at the observation time.'),
                                                'wind_speed_of_gust': pdp.mkOpt('Wind Gust (Max.)', 'Similar to maximum wind speed. Max wind gust often has a duration requirement that\'s different than maximum wind speed.'),
                                                'wind_from_direction_mean': pdp.mkOpt('Wind Direction (Mean)', 'The instantaneous direction of from which the wind blows in degrees.'),
                                                'wind_from_direction_point': pdp.mkOpt('Wind Direction (Point)', 'Direction of from which the wind blows in degrees. Averaged across all measurements taken over the observational period as defined by the observational frequency.'),
                                                'wind_from_direction_standard_deviation': pdp.mkOpt('Wind Direction (Std Dev)'), }),
                         Miscellaneous: pdp.mkOptGroup({ 'air_pressure_point': pdp.mkOpt('Air Pressure (Point)', 'Atmospheric pressure at station elevation in units of mb.'),
                                                         'tendency_of_air_pressure_sum': pdp.mkOpt('Air Pressure Tendency', 'Magnitude and sign of the rate of change of atmospheric pressure.'),
                                                         'duration_of_sunshine_sum': pdp.mkOpt('Sunshine Duration', 'Number of hours of bright sunshine recorded over the observational period typically stated as over a single day.'),
                                                         'cloud_area_fraction_point': pdp.mkOpt('Cloud Cover Fraction', 'Fraction of sky hemisphere obscured by clouds.'),
                                                         'mean_sea_level_point': pdp.mkOpt('Mean Sea Level', 'Water level of ocean relative to reference sea level datum. Typically indicates tide stade.'),
                                                         'surface_downwelling_shortwave_flux_mean': pdp.mkOpt('Incoming Shortwave', 'Shortwave, solar radiation directed toward the earth\'s surface.'),
                                                         'volume_fraction_of_condensed_water_in_soil_point': pdp.mkOpt('Soil Moisture', 'Amount of moisture in soils as a fraction of unit soil volume.') })
                       };

    varSel = pdp.getSelectorWithHelp('Climate Variables', 'variables', 'input-var', 'input-var', '', variableData, 'View variable definitions', 450, 450);
    $(varSel).change(pdp.curry(varChange, map)).change(pdp.curry(CRMPFilterChange, map));
    return varSel;
}

function createNetworkHelpItem(name, help) {
    var frag = document.createDocumentFragment(),
        tr = frag.appendChild(document.createElement("tr")),
        icon = tr.appendChild(document.createElement('td')).appendChild(document.createElement('img'));
    help.id = name;
    icon.src = help.icon;
    $.each(['id', 'name'], function (idx, val) { tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(help[val])); });
    return frag;
}

function getNetworkHelpRecursive(vals) {
    var frag = document.createDocumentFragment(),
        depth = 0;
    $.each(vals, function (idx, val) {
        if ($.isArray(val)) {
            frag.appendChild(pdp.createHelpGroup(idx, getNetworkHelpRecursive(val[0]), depth + 1));
        } else if (val.help !== undefined) {
            frag.appendChild(createNetworkHelpItem(val.name, val.help));
        }
        return true;
    });
    return frag;
}

function getNetworkHelp(vals) {
    var frag = document.createDocumentFragment(),
        tr = frag.appendChild(document.createElement("tr"));
    $.each(['Color', 'Network ID', 'Network Name'], function (idx, val) { tr.appendChild(document.createElement('th')).appendChild(document.createTextNode(val)); });
    frag.appendChild(getNetworkHelpRecursive(vals));
    return frag;
}

function createNetworkOptions(map) {
    var networkOptionData, netSel;
    networkOptionData = {
        '': pdp.mkOpt('All'),
        'AGRI': pdp.mkOpt('AGRI', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/agri.png', name: 'BC Ministry of Agriculture'}),
        'ARDA': pdp.mkOpt('ARDA', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/arda.png', name: 'Agricultural and Rural Development Act Network'}),
        'BCH': pdp.mkOpt('BCH', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/bch.png', name: 'BC Hydro'}),
        'EC': pdp.mkOpt('EC', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/ec.png', name: 'Environment Canada (Canadian Daily Climate Data 2007)'}),
        'EC_raw': pdp.mkOpt('EC_raw', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/ec_raw.png', name: 'Environment Canada (raw observations from "Climate Data Online")'}),
        'ENV-AQN': pdp.mkOpt('ENV-AQN', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/env-aqn.png', name: 'BC Ministry of Environment - Air Quality Network'}),
        'ENV-ASP': pdp.mkOpt('ENV-ASP', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/env-asp.png', name: 'BC Ministry of Environment - Automated Snow Pillow Network'}),
        'FLNRO-FERN': pdp.mkOpt('FLNRO-FERN', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/flnro-fern.png', name: 'BC Ministry of Forests, Lands, and Natural Resource Operations - Forest Ecosystems Research Network'}),
        'FLNRO-WMB': pdp.mkOpt('FLNRO-WMB', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/flnro-wmb.png', name: 'BC Ministry of Forests, Lands, and Natural Resource Operations - Wild Fire Managment Branch'}),
        'FRBC': pdp.mkOpt('FRBC', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/frbc.png', name: 'Forest Renewal British Columbia'}),
        'MoTIe': pdp.mkOpt('MoTIe', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/motie.png', name: 'Ministry of Transportation and Infrastructure (electronic)'}),
        'MoTIm': pdp.mkOpt('MoTIm', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/motim.png', name: 'Ministry of Transportation and Infrastructure (manual)'}),
        'MVan': pdp.mkOpt('MVan', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/mvan.png', name: 'Metro Vancouver'}),
        'RTA': pdp.mkOpt('RTA', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/rta.png', name: 'RioTintoAlcan'})
    };
    netSel = pdp.getSelectorWithHelp('Network Name', 'network-name', 'network-name', 'input-network', '', networkOptionData, 'View table of network names', 800, 450, 'table', getNetworkHelp);
    $(netSel).change(pdp.curry(netChange, map)).change(pdp.curry(CRMPFilterChange, map));
    return netSel;
}

function createFrequencyOptions(map) {
    var frequencyOptionData, freqSel;

    frequencyOptionData = {
        '': pdp.mkOpt('Any'),
        '1-hourly': pdp.mkOpt('Hourly', 'Measurements made or averaged or summed at an hourly interval. For point measurements, these observations were taken on or near to the hour.'),
        'daily': pdp.mkOpt('Daily', 'Measurements made or averaged or summed at a daily interval. There typically are not point measurements at a daily interval.'),
        '12-hourly': pdp.mkOpt('Semi-daily', 'Measurement frequency changes either due to changes in network operations or by virtue of instrument type and remoteness of location.')
    };

    freqSel = pdp.getSelectorWithHelp('Observation Frequency', 'frequency', 'input-freq', 'input-freq', '', frequencyOptionData, 'View frequency explanations', 450, 450);
    $(freqSel).change(pdp.curry(freqChange, map)).change(pdp.curry(CRMPFilterChange, map));
    return freqSel;
}

function getClimatologyCheckbox(map) {
    var climaSel = pdp.getCheckbox('with-climatology', 'input-climatology', 'only-with-climatology', 'only-with-climatology', 'Only include stations with 1971-2000 climatology');
    $(climaSel).change(pdp.curry(hasClimaChange, map)).change(pdp.curry(CRMPFilterChange, map));
    return climaSel;
}

function getResetButton(map) {
    var reset_button = pdp.createInputElement("reset", "", "filter-reset", "filter-reset", "Reset Filters");
    $(reset_button).bind('click', function () {
        this.form.reset();
        filter_clear(map);
        dateChange(map);
        CRMPFilterChange(map);
        return false;
    });
    return reset_button;
}

function getCRMPDateRange(map) {
    var dateRange = getDateRange();
    $('#from-date, #to-date', dateRange).change(pdp.curry(dateChange, map)).change(pdp.curry(CRMPFilterChange, map));
    return dateRange;
}

function getCRMPControls(map) {
    var div = pdp.createDiv('', 'control'),
        fieldset = pdp.createFieldset("filterset", "Filter Options");
    fieldset.appendChild(getCRMPDateRange(map));
    fieldset.appendChild(createVariableOptions(map));
    fieldset.appendChild(createNetworkOptions(map));
    fieldset.appendChild(createFrequencyOptions(map));
    fieldset.appendChild(getClimatologyCheckbox(map));
    fieldset.appendChild(pdp.getTextareaLabeled('infobox', 'Selection Information', "0 stations\n0 observations\n0 climatologies", 'readonly'));
    fieldset.appendChild(getResetButton(map));
    div.appendChild(fieldset);
    return div;
}

function downloadMetadata(e, map) {
    var select_elem, sel_idx, req_type, url, params, stns_lyr, filters, formatter, xml;

    select_elem = e.target.parentElement.parentElement.childNodes[1].childNodes[1];
    sel_idx = select_elem.options.selectedIndex;
    req_type = select_elem.options[sel_idx].parentNode.label;
    stns_lyr = map.getLayersByName('PCDS stations')[0];

    filters = map.composite_filter;
    formatter = new OpenLayers.Format.Filter.v1_1_0({defaultVersion: "1.1.0", outputFormat: "GML3", xy: req_type === 'WMS'});
    xml = new OpenLayers.Format.XML();

    if (req_type === 'WMS') {
        url = '/geoserver/CRMP/wms?service=WMS';
        params = {
            'version': '1.1.0',
            'request': 'GetMap',
            'layers': 'CRMP:crmp_network_geoserver',
            'bbox': map.getExtent().toBBOX(),
            'width': map.size.w,
            'height': map.size.h,
            'srs': stns_lyr.params.SRS,
            'format': select_elem[sel_idx].value
        };
    } else if (req_type === 'WFS') {
        url = '/geoserver/CRMP/ows?service=WFS';
        params = {
            'version': '1.1.0',
            'request': 'GetFeature',
            'typeName': 'CRMP:crmp_network_geoserver',
            'outputFormat': select_elem[sel_idx].value,
            'srsname': 'epsg:4326'
        };
    }
    if (filters) {
        params.filter = xml.write(formatter.write(filters));
    }

    url = url + '&' + $.param(params);
    window.open(url);
}
