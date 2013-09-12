function createVariableOptions(map) {
    var variableData = { '': mkOpt('All'), 
			 lwe_thickness_of_precipitation_amount_sum: mkOpt('Precipitation Amount', 'Precipitation amount is the total of precipitation over an observational period regardless of precipitation type. Where snowfall occurs, this is intended to be the total water equivalent precipitation amount.'), 
			 air_temperature_mean: mkOpt('Temperature (Mean)', 'Mean temperature refers to the average of temperature measurements taken at a measurement frequency greater or equal to that of the native data frequency. Generally, temperature measurements are taken at 1.5 m to 2 m above ground level. However, for many networks, this height changes as snow levels rise in winter. Often, precise indications of actual sensor height are not availble.'),
			 Temperature: mkOptGroup({ air_temperature_minimum: mkOpt('Temperature (Min.)', 'Minimum temperature is the minimum temperature value observed during the observation interval.'), 
						   air_temperature_maximum: mkOpt('Temperature (Max.)', 'Maximum temperature is the minimum temperature value observed during the observation interval.'), 
						   air_temperature_point: mkOpt('Temperature (Point)', 'Temperature measured instantaneosly at the observation time.'), 
						   'air_temperaturet: mean within days t: mean within months t: mean over years': mkOpt('Temperature Climatology (Mean)', 'This is the climatological average for mean daily air temperature averaged for all days in a month and for all years for a given month.'), 
						   'air_temperaturet: minimum within days t: mean within months t: mean over years': mkOpt('Temperature Climatology (Min.)', 'This is the climatological average for minimum daily air temperature averaged for all days in a month and for all years for a given month.'), 
						   'air_temperaturet: maximum within days t: mean within months t: mean over years': mkOpt('Temperature Climatology (Max.)', 'This is the climatological average for maximum daily air temperature averaged for all days in a month and for all years for a given month.') }),
			 Precipitation: mkOptGroup({ 'lwe_thickness_of_precipitation_amountt: sum within months t: mean over years': mkOpt('Precipitation Climatology', 'This is the climatological average for monthly total precipitation averaged across all years for a given month.'), 
						     'lwe_thickness_of_precipitation_sum': mkOpt('Precipitation (Cumulative)', 'Precipitation accumulated in an instrument gauge between manual or automatic purging of the gauge. Such guages are often installed in locations where opportunities to empty the gauge are rare. Because of this, cumulative precipitation amounts are subject to inaccuracies due to evaporation, snow capping or other precipitation loss.'),
						     thickness_of_rainfall_amount: mkOpt('Rainfall Amount', 'Liquid precipitation accumulated over the observational period defined by the observational frequency.'), 
						     thickness_of_snowfall_amount: mkOpt('Snowfall Amount', 'Solid precipitation accumulated over the observational period defined by the observational frequency.'), 
						     surface_snow_thickness_point: mkOpt('Surface Snow Depth', 'Depth of snow on the ground at the time of observation.') }),
			 Humidity: mkOptGroup({ relative_humidity_mean: mkOpt('Relative Humidity (Mean)', 'The percent saturation of the atmosphere with respect to water vapor averaged across all measurements taken over the observational period as defined by the observational frequency.'), 
						relative_humidity_minimum: mkOpt('Relative Humidity (Min.)', 'The percent saturation of the atmosphere with respect to water vapor as a minimum across all measurements taken over the observational period as defined by the observational frequency.'), 
						relative_humidity_maximum: mkOpt('Relative Humidity (Max.)', 'The percent saturation of the atmosphere with respect to water vapor as a maximum across all measurements taken over the observational period as defined by the observational frequency.'), 
						relative_humidity_point: mkOpt('Relative Humidity (Point)', 'The instantaneous percent saturation of the atmosphere with respect to water vapor at the observation time.'), 
						dew_point_temperature_point: mkOpt('Dew Point Temperature (Point)', 'The instantaneous temperature, for a given atmospheric water vapor content, at which an airmass becomes saturated with respect to water vapor and condensation may occur.'), 
						dew_point_temperature_mean: mkOpt('Dew Point Temperature (Mean)', 'The temperature, for a given atmospheric water vapor content, at which an airmass becomes saturated with respect to water vapor and condensation may occur. Averaged across all measurements taken over the observational period as defined by the observational frequency.') }),
			 Wind: mkOptGroup({ 'wind_speed_mean': mkOpt('Wind Speed (Mean)', 'Scalar speed of wind averaged over all measurements taken over the observational period as defined by the observational frequency.'), 
					    'wind_speed_minimum': mkOpt('Wind Speed (Min.)', 'Minimum scalar speed of wind observed from all measurements taken over the observational period as defined by the observational frequency.'), 
					    'wind_speed_maximum': mkOpt('Wind Speed (Max.)', 'Maximum scalar speed of wind observed from all measurements taken over the observational period as defined by the observational frequency.'), 
					    'wind_speed_point': mkOpt('Wind Speed (Point)', 'The instantaneous scalar speed of wind observed at the observation time.'), 
					    'wind_speed_of_gust': mkOpt('Wind Gust (Max.)', 'Similar to maximum wind speed. Max wind gust often has a duration requirement that\'s different than maximum wind speed.'), 
					    'wind_from_direction_mean': mkOpt('Wind Direction (Mean)', 'The instantaneous direction of from which the wind blows in degrees.'), 
					    'wind_from_direction_point': mkOpt('Wind Direction (Point)', 'Direction of from which the wind blows in degrees. Averaged across all measurements taken over the observational period as defined by the observational frequency.'), 
					    'wind_from_direction_standard_deviation': mkOpt('Wind Direction (Std Dev)' /* NO HELP */), }),
			 Miscellaneous: mkOptGroup({ 'air_pressure_point': mkOpt('Air Pressure (Point)', 'Atmospheric pressure at station elevation in units of mb.'), 
						     'tendency_of_air_pressure_sum': mkOpt('Air Pressure Tendency', 'Magnitude and sign of the rate of change of atmospheric pressure.'), 
						     'duration_of_sunshine_sum': mkOpt('Sunshine Duration', 'Number of hours of bright sunshine recorded over the observational period typically stated as over a single day.'), 
						     'cloud_area_fraction_point': mkOpt('Cloud Cover Fraction', 'Fraction of sky hemisphere obscured by clouds.'), 
						     'mean_sea_level_point': mkOpt('Mean Sea Level', 'Water level of ocean relative to reference sea level datum. Typically indicates tide stade.'), 
						     'surface_downwelling_shortwave_flux_mean': mkOpt('Incoming Shortwave', 'Shortwave, solar radiation directed toward the earth\'s surface.'), 
						     'volume_fraction_of_condensed_water_in_soil_point': mkOpt('Soil Moisture', 'Amount of moisture in soils as a fraction of unit soil volume.') })
		       };

    var varSel = getSelectorWithHelp('Climate Variables', 'variables', 'input-var', 'input-var', '', variableData, 'View variable definitions', 450, 450);
    $(varSel).change(curry(varChange, map)).change(curry(CRMPFilterChange, map));
    return varSel;
}

function createNetworkHelpItem(name, help) {
    var frag = document.createDocumentFragment();
    var tr = frag.appendChild(document.createElement("tr"));
    help['id'] = name;
    var icon = tr.appendChild(document.createElement('td')).appendChild(document.createElement('img'));
    icon.src = help['icon'];
    $.each(['id', 'name'], function(idx, val) { tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(help[val])); });
    return frag;
}

function getNetworkHelpRecursive(vals) {
    var frag = document.createDocumentFragment();
    $.each(vals, function(idx, val) {
	if($.isArray(val))
	    frag.appendChild(createHelpGroup(idx, getNetworkHelpRecursive(val[0]), depth + 1));
	else
	    if(typeof val.help != 'undefined')
		frag.appendChild(createNetworkHelpItem(val.name, val.help));
	return true;
    });
    
    return frag;
}

function getNetworkHelp(vals) {
    var frag = document.createDocumentFragment();
    var tr = frag.appendChild(document.createElement("tr"));
    $.each(['Color', 'Network ID', 'Network Name'], function(idx, val) { tr.appendChild(document.createElement('th')).appendChild(document.createTextNode(val)); });
    frag.appendChild(getNetworkHelpRecursive(vals));
    return frag;
}

function createNetworkOptions(map) {
    var networkOptionData = { 
	'': mkOpt('All'),
	'AGRI': mkOpt('AGRI', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/agri.png', name: 'BC Ministry of Agriculture'}), 
	'ARDA': mkOpt('ARDA', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/arda.png', name: 'Agricultural and Rural Development Act Network'}), 
	'BCH': mkOpt('BCH', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/bch.png', name: 'BC Hydro'}), 
	'EC': mkOpt('EC', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/ec.png', name: 'Environment Canada (Canadian Daily Climate Data 2007)'}), 
	'EC_raw': mkOpt('EC_raw', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/ec_raw.png', name: 'Environment Canada (raw observations from "Climate Data Online")'}), 
	'ENV-AQN': mkOpt('ENV-AQN', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/env-aqn.png', name: 'BC Ministry of Environment - Air Quality Network'}), 
	'ENV-ASP': mkOpt('ENV-ASP', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/env-asp.png', name: 'BC Ministry of Environment - Automated Snow Pillow Network'}), 
	'FLNRO-FERN': mkOpt('FLNRO-FERN', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/flnro-fern.png', name: 'BC Ministry of Forests, Lands, and Natural Resource Operations - Forest Ecosystems Research Network'}), 
	'FLNRO-WMB': mkOpt('FLNRO-WMB', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/flnro-wmb.png', name: 'BC Ministry of Forests, Lands, and Natural Resource Operations - Wild Fire Managment Branch'}), 
	'FRBC': mkOpt('FRBC', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/frbc.png', name: 'Forest Renewal British Columbia'}), 
	'MoTIe': mkOpt('MoTIe', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/motie.png', name: 'Ministry of Transportation and Infrastructure (electronic)'}), 
	'MoTIm': mkOpt('MoTIm', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/motim.png', name: 'Ministry of Transportation and Infrastructure (manual)'}), 
	'MVan': mkOpt('MVan', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/mvan.png', name: 'Metro Vancouver'}), 
	'RTA': mkOpt('RTA', {icon: 'http://tools.pacificclimate.org/data_portal/images/legend/rta.png', name: 'RioTintoAlcan'}) 
    };
    var netSel = getSelectorWithHelp('Network Name', 'network-name', 'network-name', 'input-network', '', networkOptionData, 'View table of network names', 800, 450, 'table', getNetworkHelp);
    $(netSel).change(curry(netChange, map)).change(curry(CRMPFilterChange, map));
    return netSel;
}

function createFrequencyOptions(map) {
    var frequencyOptionData = {
	'': mkOpt('Any'),
	'1-hourly': mkOpt('Hourly', 'Measurements made or averaged or summed at an hourly interval. For point measurements, these observations were taken on or near to the hour.'),
	'daily': mkOpt('Daily', 'Measurements made or averaged or summed at a daily interval. There typically are not point measurements at a daily interval.'),
	'12-hourly': mkOpt('Semi-daily', 'Measurement frequency changes either due to changes in network operations or by virtue of instrument type and remoteness of location.')
    };
    
    var freqSel = getSelectorWithHelp('Observation Frequency', 'frequency', 'input-freq', 'input-freq', '', frequencyOptionData, 'View frequency explanations', 450, 450);
    $(freqSel).change(curry(freqChange, map)).change(curry(CRMPFilterChange, map));
    return freqSel;
}

function getClimatologyCheckbox(map) {
    var climaSel = getCheckbox('with-climatology', 'input-climatology', 'only-with-climatology', 'only-with-climatology', 'Only include stations with 1971-2000 climatology');
    $(climaSel).change(curry(hasClimaChange, map)).change(curry(CRMPFilterChange, map));
    return climaSel;
}

function getResetButton() {
    return createInputElement("reset", "", "filter-reset", "filter-reset", "Reset Filters");
}

function getCRMPDateRange(map) {
    var dateRange = getDateRange();
    $('#from-date, #to-date', dateRange).change(curry(dateChange, map)).change(curry(CRMPFilterChange, map));
    return dateRange;
}

function getCRMPControls(map) {
    var form = createForm("filter", "station_filters", "get");
    var fieldset = createFieldset("filterset", "Filter Options");
    fieldset.appendChild(getCRMPDateRange(map));
    fieldset.appendChild(createVariableOptions(map));
    fieldset.appendChild(createNetworkOptions(map));
    fieldset.appendChild(createFrequencyOptions(map));
    fieldset.appendChild(getClimatologyCheckbox(map));
    fieldset.appendChild(getTextareaLabeled('infobox', 'Selection Information', "0 stations\n0 observations\n0 climatologies", 'readonly'));
    fieldset.appendChild(getResetButton());
    form.appendChild(fieldset);
    $(form).bind('reset', function() {filter_clear(map); CRMPFilterChange(map); });

    return form;
}
