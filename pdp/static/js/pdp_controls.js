/*jslint browser: true, devel: true */
/*global $, jQuery, createRasterFormatOptions, createDownloadLink, getRasterNativeProj, ncwmsCapabilities, getRasterBbox, rasterBBoxToIndicies, intersection, getTimeSelected*/
"use strict";

// globals
var ncwms, map;
// var pdp, ncwms, map;

// Note re. "datepickers":
//
// At present we are using only ordinary textbox input elements for user date
// input. We would like to use a more sophisticated UI element such as jQuery
// UI's Datepicker, but it is limited to the Gregorian calendar (as is the JS
// native `Date` object). Since we must handle non-Gregorian calendars, we
// must either roll our own or settle for a simpler UI. We chose the latter.
//
// Therefore presently our datepickers are input elements with the following
// data value attached to them using the jQuery `.data()` method:
//
//      'cfDate': a `CfDatetime` object representing the value of the datepicker.
//          Such an object carries with it the full specification of the
//          CF time system (units, since, calendar) in which the value is
//          embedded.

function setDatepicker(element, cfDate) {
    // Set a datepicker element's value.
    // Update both the input element's value and the associated cfDate datum.
    element.data('cfDate', cfDate);
    element.val(cfDate.toLooseString(true));
}

function setCfTimeSystemMessages(within, cfTimeSystem) {
    var calendar = cfTimeSystem.startDate.calendar;
    within.find('#date-range-calendar .value')
        .html(calendar.name + ' (\'' + calendar.type + '\')');
    within.find('#date-range-ts-units')
        .text(cfTimeSystem.units);
    within.find('#date-range-ts-start-date')
        .text(cfTimeSystem.startDate.toISOString(true));
    within.find('#date-range-ts-max-date')
        .text(cfTimeSystem.lastCfDatetime().toISOString(true));
}


function getDateRange(
    startDate, endDate, omitFullTimeCheckbox, omitTimeSystemInfo
) {
    var rangeDiv = $(
        '<div id="date-range">' +
        '   <label id="date-range-label" for="date-range">Date Range</label>' +
        '   <div id="date-range-inputs">' +
        '       <input type="text" id="from-date" name="from-date" ' +
        '       class="datepickerstart">' +
        '       to ' +
        '       <input type="text" id="to-date" name="to-date" ' +
        '       class="datepickerend">' +
        '       <input type="hidden" id="input-polygon" name="input-polygon">' +
        '   </div>' +
        '   <div id="date-range-messages">' +
        '       <div id="date-range-error-messages">' +
        '           <div id="from-date-error-message" class="inactive">' +
        '               <span class="label">From date: </span><span class="value"/>' +
        '           </div>' +
        '           <div id="to-date-error-message" class="inactive">' +
        '               <span class="label">To date: </span><span class="value"/>' +
        '           </div>' +
        '       </div>' +
        '       <div id="date-range-annotations">' +
        '           <div id="date-range-calendar">' +
        '               <span class="label">Calendar: </span><span class="value"/>' +
        '           </div>' +
        '           <div id="date-range-ts">' +
        '               <span class="label">Time System: </span>' +
        '               <span id="date-range-ts-units" class="value"/>' +
        '               since ' +
        '               <span id="date-range-ts-start-date" class="value"/>' +
        '               \n(up to ' +
        '               <span id="date-range-ts-max-date"/>)' +
        '           </div>' +
        '       </div>' +
        '   </div>' +
        '</div>'
    );

    if (omitTimeSystemInfo) {
        // This could be done by omitting the HTML, but this is easy.
        rangeDiv.find('#date-range-annotations').css({ display: 'none'});
    }

    var $startDate = rangeDiv.find("#from-date");
    var $endDate = rangeDiv.find("#to-date");

    setDatepicker($startDate, startDate);
    setDatepicker($endDate, endDate);

    setCfTimeSystemMessages(rangeDiv, startDate.system);

    if (!omitFullTimeCheckbox) {
        $(
            '<div id="download-all-time">' +
            '   <input type="checkbox" id="download-full-timeseries" name="download-full-timeseries">' +
            '   <label for="download-full-timeseries">Download Full Timeseries</label>' +
            '</div>'
        ).appendTo(rangeDiv);

        $("#pdp-controls").on(
            "change", "#download-full-timeseries",
            function(evt) {
                var $startDate = $('#from-date');
                var $endDate = $('#to-date');
                if (this.checked) {
                    // Specify full timeseries download by setting to min/max dates
                    var startDate = $startDate.data('cfDate');
                    setDatepicker($startDate, startDate.system.firstCfDatetime());
                    $startDate.prop('disabled', true);

                    var endDate = $endDate.data('cfDate');
                    setDatepicker($endDate, endDate.system.lastCfDatetime());
                    $endDate.prop('disabled', true);

                    // Trigger event to call dlLink.onTimeChange()
                    $("[class^='datepicker']").trigger("change");
                } else {
                    $startDate.prop('disabled', false);
                    $endDate.prop('disabled', false);
                }
            }
        );
    }

    // [0] converts from jQuery object to HTML element
    return rangeDiv[0];
}

function processDateRangeInput($date, fallbackFlag, $error) {
    // Process the content of a date range input element `$date` by:
    //    - updating its associated `cfDate` data value according to the
    //      input element content; convert it to a CfTime in the same
    //      CF time system as the existing data value
    //    - updating the error element `$error` according to success or
    //      failure of the conversion
    // If the date input element contains invalid content:
    //  - use the date specified by `fallbackFlag`: falsy => first date
    //      in CF time system; truthy => last date.
    //  - set an error message
    // Finally, return the actual date set (from input or fallback if error).
    var cfTimeSystem = $date.data('cfDate').system;

    var date;
    try {
        date = calendars.CfDatetime.fromLooseFormat(cfTimeSystem, $date.val());
        $date.val(date.toLooseString(true));
        $date.data('validEntry', true);
        $error.addClass('inactive');
        $error.find('.value').html('');
    } catch(error) {
        date = fallbackFlag ?
            cfTimeSystem.lastCfDatetime() :
            cfTimeSystem.firstCfDatetime();
        $date.data('validEntry', false);
        $error.removeClass('inactive');
        $error.find('.value').html(error.message);
    }

    $date.data('cfDate', date);

    return date;
}


function generateMenuTree(subtree, leafNameMapping) {
    var ul = $("<ul/>");
    /*jslint unparam: true*/
    $.each(Object.keys(subtree), function (index, stuff) {
        var newlayer, linkText,
            li = $('<li/>');
        if (subtree[stuff] instanceof Object) {
            li.append($('<a/>').text(stuff)).append(generateMenuTree(subtree[stuff], leafNameMapping));
        } else {
            newlayer = subtree[stuff] + "/" + stuff;
            linkText = stuff;
            if (leafNameMapping !== undefined) {
                linkText = leafNameMapping[stuff];
            }
            li.attr('id', newlayer);
            $('<a/>').text(linkText).click(function () {
                ncwms.params.LAYERS = newlayer;
                ncwms.events.triggerEvent('change', newlayer);
            }).addClass('menu-leaf').appendTo(li);
        }
        li.appendTo(ul);
    });
    /*jslint unparam: false*/
    return ul;
}

function getRasterAccordionMenu(ensembleName, leafNameMapping) {
    var divId = "dataset-menu";
    var div = pdp.createDiv(divId);

    dataServices.getRasterAccordionMenuData(ensembleName).done(function (data) {
        var menu_tree = generateMenuTree(data, leafNameMapping);
        menu_tree.addClass("dataset-menu");
        $("#" + divId).html(menu_tree);
        $(".dataset-menu").accordion({
            accordion: true,
            speed: 200,
            closedSign: '[+]',
            openedSign: '[-]'
        });
    });
    return div;
}

// Some portals (vic_app and canada_ex_app) display two versions of the same
// dataset: an up-to-date version, and an archive of the older version that was
// previously displayed on the site and is only maintained for comparison or 
// compatibility with other old data.
// These functions support the portals that display multiple versions of a dataset.
function isArchivePortal() {
	// not a sophisticated function; just checks to see if "archive" is in the URL.
	return $(location).attr('href').indexOf("archive") != -1;
};

// Make a label with text disclaimer for archived datasets
function getArchiveDisclaimer() {
  const disText = "These methods are provided for research / comparison to older analysis purposes only, and caution with their use is advised.";
  return pdp.createLabel("disclaimer", disText);
};

// Adds a link to the other portal to the navbar
function addPortalLink(url_base, text) {
	const portalLink = pdp.createLink("portal-link",
                undefined,
                pdp.app_root + '/' + url_base + "/map/",
                text);
    document.getElementById("topnav").appendChild(portalLink);
};


var getRasterControls = function (ensemble_name) {
    var div = pdp.createDiv('', 'control'),
        form = pdp.createForm(undefined, undefined, undefined),
        fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
};


function cfDateTimeFor(cfTimeSystem, specifier) {
    // Converts the time system-independent specifier `specifier` to a
    // a CfDatetime having the time system given by `cfTimeSystem`.
    //
    // Currently `specifier` is a string with fairly obvious meanings.
    // This could easily be extended to allow `specifier` values of, e.g.,
    // type `SimpleDatetime`, which is another time system-independent
    // way of describing a date (but absolute, rather than relative, as the
    // strings currently give).
    if (_.isString(specifier)) {
        var spec2Method = {
            first: 'firstCfDatetime',
            last: 'lastCfDatetime',
            today: 'todayAsCfDatetime',
        };
        var method = _.get(spec2Method, specifier, 'todayAsCfDatetime');
        return cfTimeSystem[method]();
    }
}

var getRasterDownloadOptions = function (startDateSpec, endDateSpec) {
    var frag = document.createDocumentFragment(),
        div = frag.appendChild(pdp.createDiv('', 'control')),
        downloadForm = div.appendChild(pdp.createForm("download-form", "download-form", "get")),
        downloadFieldset = downloadForm.appendChild(pdp.createFieldset("downloadset", "Download Data"));
    if (startDateSpec || endDateSpec) {
        // If a start date or end date is specified, then add the date range
        // controls to the form.

        // Assign an initial time system. This will be replaced by the time
        // system dictated by the ncwms layer, but it loads asynchronously
        // and is not available at this point.
        // TODO: Should this be removed and replaced with 'undefined' for
        // the values of the temporary start and end date? It would make more
        // sense, but this is safer in that it is less likely to break existing
        // code, a major consideration.
        var calendar = calendars['gregorian'];
        var units = 'days';
        var cfTimeSystem = new calendars.CfTimeSystem(
            units,
            new calendars.CalendarDatetime(calendar, 1870, 1, 1),
            Math.floor((2100 - 1870 + 1) * 365.2425)
        );
        var startDate = cfDateTimeFor(cfTimeSystem, startDateSpec);
        var endDate = cfDateTimeFor(cfTimeSystem, endDateSpec);

        // Add date range controls.
        downloadFieldset.appendChild(getDateRange(startDate, endDate));
    }
    downloadFieldset.appendChild(createRasterFormatOptions());
    //downloadFieldset.appendChild(createDownloadButtons("download-buttons", "download-buttons", {"download-timeseries": "Download", "metadata": "Metadata", "permalink": "Permalink"}));
    downloadFieldset.appendChild(createDownloadLink("download-links", undefined, {"download-timeseries": "Download", "download-metadata": "Metadata"}));
    return frag;
};

var round = function (number) {
    return Math.round(number * 100) / 100;
};

// Colorbar class
//
// Usage is something like this:
//
//  var cb = new Colorbar("pdpColorbar", my_ncwms_layer);
//  cb.refresh_values();

function Colorbar(div_id, layer) {
    this.div_id = div_id;
    this.layer = layer;
    this.minimum = 0.0;
    this.maximum = 0.0;
    this.units = "";

    // create and style the children elements
    $("#" + div_id).html('<div id="minimum"></div><div id="midpoint"></div><div id="maximum"></div>');
    $("#" + div_id).css({border: "2px solid black"});
    $('#maximum').css({ position: "absolute", top: "-0.5em", right: "20px"});
    $('#midpoint').css({ position: "absolute", top: "50%", right: "20px"});
    $('#minimum').css({ position: "absolute", bottom: "-0.5em", right: "20px"});
}

// FIXME: We cannot use layer.params.* for anything if we want the event handling to be order agnostic
Colorbar.prototype = {
    constructor: Colorbar,

    calculate_midpoint: function () {
        if (this.layer.params.LOGSCALE) {
            var min = this.minimum <= 0 ? 1 : this.minimum;
            return Math.exp(((Math.log(this.maximum) - Math.log(min)) / 2 ) + Math.log(min));
        }
        return (this.minimum + this.maximum) / 2;
    },

    graphic_url: function () {
        var palette = this.layer.params.STYLES.split('/')[1];
        return pdp.ncwms_url + "?REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=1" +
            "&HEIGHT=300" +
            "&PALETTE=" + palette +
            "&NUMCOLORBANDS=254";
    },

    metadata_url: function (lyr_id) {
        if (lyr_id === undefined) {
            lyr_id = this.layer.params.LAYERS;
        }

        return "../metadata.json?request=GetMinMaxWithUnits" +
            "&id=" + lyr_id.split('/')[0] +
            "&var=" + lyr_id.split('/')[1];

    },

    format_units: function (units) {
        // reformat known units:
        // 'mm d-1', '%', 'days', 'meters s-1', 'm', 'mm',
        // 'degrees_C', 'kg m-2', 'degC', 'mm day-1', 'celsius'
        switch (units) {
        case "degC":
        case "degrees_C":
        case "celsius":
            return "&#8451;";
        case "mm d-1":
        case "mm day-1":
            return "mm/day";
        case "meters s-1":
            return "m/s";
        case "kg m-2":
            return "kg/m<sup>2</sup>";
        default:
            return units;
        }
    },

    round_to_nearest: function (value, mult) {
      if (mult > 0) {
        return Math.round(value / mult) * mult;
      } else {
        return Math.round(value * mult) / mult;
      }
    },

    // Returns the estimated rounding precicion, based on the range.
    // Negative values indicate reverse rounding.
    estimate_precision: function (min, max) {
      var range = max - min;
      if (range > 10000) {
        return 100;
      } else if (range > 100) {
        return 10;
      } else if (range > 10) {
        return 1;
      } else if (range > 1) {
        return -10;
      } else {
        return -100;
      }
    },

    refresh_values: function (lyr_id) {
        var _this = this;
        var request = dataServices.getMetadata(lyr_id || this.layer.params.LAYERS);

        request.done(function (data) {
            _this.minimum = data.min;
            _this.maximum = data.max;
            _this.units = _this.format_units(data.units);
            _this.redraw();
        });
    },

    force_update: function (min, max, units) {
        this.minimum = min;
        this.maximum = max;
        if (units !== undefined) {
            this.units = this.format_units(units);
        }
        this.redraw();
    },

    redraw: function () {
        var prec = this.estimate_precision(this.minimum, this.maximum);
        var div = $("#" + this.div_id);
        div.css('background-image', "url(" + this.graphic_url() + ")");
        div.find("#minimum").html(this.round_to_nearest(this.minimum, prec)  + " " + this.units);
        div.find("#maximum").html(this.round_to_nearest(this.maximum, prec) + " " + this.units);
        div.find("#midpoint").html(this.round_to_nearest(this.calculate_midpoint(), prec) + " " + this.units);
    }
};


function RasterDownloadLink(element, layer, catalog, ext, varname, trange, yrange, xrange) {
    this.element = element;
    this.layer = layer;
    this.catalog = catalog;
    this.url_template = '{dl_url}.{ext}?{varname}[{trange}][{yrange}][{xrange}]&';
    this.dl_url = ''; // Needs the catalog to determine this
    this.ext = ext;
    this.varname = varname;
    this.trange = trange;
    this.yrange = yrange;
    this.xrange = xrange;
    this.registrants = [];
}
RasterDownloadLink.prototype = {
    constructor: RasterDownloadLink,

    register: function (context, fun) {
        this.registrants.push({'context': context,
                               'fun': fun});
    },

    trigger: function () {
        this.registrants.forEach(
            function (currentValue, index, array) {
                currentValue.fun(currentValue.context);
            },
            this
        );
    },
    setXYRange: function (raster_index_bounds) {
        if (raster_index_bounds.toGeometry().getArea() === 0) {
            // Is the point tool being used?
            var feature = this.layer.map.getLayersByName("Box Selection")[0].features[0];
            if (feature.geometry.id.indexOf("OpenLayers_Geometry_Point") > -1) {
                this.getSingleCellDownloadLink(raster_index_bounds, feature)
                return;
            } else {
                alert("Cannot resolve selection to data grid. Please zoom in and select only within the data region.");
                return;
            }
        }
        this.xrange = raster_index_bounds.left + ':' + raster_index_bounds.right;
        this.yrange = raster_index_bounds.bottom + ':' + raster_index_bounds.top;
    },

    // Take the URL template and substitute each of the desired state variables
    getUrl: function () {
        var url, matches;
        url = this.url_template;
        matches = url.match(/\{[a-z_]+\}/g);
        matches.forEach(
            function (pattern, index, array) {
                var id = pattern.replace(/[{}]/g, ''); // remove curly braces
                url = url.replace(pattern, this[id]);
            },
            this
        );
        return url;
    },
    getSingleCellDownloadLink: function (bounds, feature) {
        if (this.ext !== "aig") {
            var props = {
                dl_url: this.dl_url,
                ext: this.ext,
                varname: this.varname,
                trange: this.trange,
                xrange: bounds.left + ':' + bounds.right,
                yrange: bounds.bottom + ':' + bounds.top
            };

            var url = this.url_template;
            var matches = url.match(/\{[a-z_]+\}/g);
            matches.forEach(
                function (pattern, index, array) {
                    var id = pattern.replace(/[{}]/g, '');
                    url = url.replace(pattern, props[id]);
                },
                this
            );
            if (url = window.prompt("Would you like to download the following subset of data?", url)) {
                location.href = url
            };
        } else {
            alert("Sorry, Arc/Info ASCII output is not currently supported for this feature.\nPlease select a different data format and try again.");
        }
        // Clear point feature after use to avoid re-prompting user to download
        // the same cell of data when they switch to a new dataset
        this.layer.map.getLayersByName("Box Selection")[0].removeFeatures(feature)
    },
    onLayerChange: function (lyr_id) {
        var dst;
        if (lyr_id === undefined) {
            lyr_id = this.layer.params.LAYERS;
        }
        dst = lyr_id.split('/')[0];
        this.varname = lyr_id.split('/')[1];
        this.dl_url = this.catalog[dst];
        this.trigger();
    },
    onExtensionChange: function (ext) {
        this.ext = ext;
        this.trigger();
    },
    onBoxChange: function (selection, ncwmsCapabilities) {
        var lyr_id, raster_proj, selection_proj,
            raster_bnds, selection_bnds, that;
        lyr_id = this.layer.params.LAYERS;
        raster_proj = getRasterNativeProj(ncwmsCapabilities, lyr_id);
        selection_proj = selection.feature.layer.projection;
        raster_bnds = getRasterBbox(ncwmsCapabilities, lyr_id);

        selection_bnds = selection.feature.geometry.bounds.clone().
            transform(selection_proj, raster_proj);
        if (!raster_bnds.intersectsBounds(selection_bnds)) {
            alert('Selection area must intersect the raster area');
            return;
        }
        selection_bnds = intersection(raster_bnds, selection_bnds);

        that = this; // save a reference to the object for the callback scope
        function callback(bnds) {
            that.setXYRange(bnds);
            that.trigger();
        }
        rasterBBoxToIndicies(this.layer.map, this.layer,
                             selection_bnds,
                             raster_proj, undefined, callback);
    },
    onTimeChange: function () {
        var startDate = processDateRangeInput(
            $('#from-date'), false, $('#from-date-error-message'));
        var endDate = processDateRangeInput(
            $('#to-date'), true, $('#to-date-error-message'));

        this.trange = startDate.toIndex() + ':' + endDate.toIndex();
        this.trigger();
    }

    // Register for changes with the ncwms layer, the box selection layer, or the download extension
};

function MetadataDownloadLink(element, layer, catalog) {
    this.element = element;
    this.layer = layer;
    this.catalog = catalog;
    this.url_template = '{dl_url}.das';
    this.dl_url = ''; // Needs the catalog to determine this
    this.registrants = [];
}
MetadataDownloadLink.prototype = {
    constructor: MetadataDownloadLink,

    // Oh man, this looks nasty. Saint Douglas would not approve.
    register: RasterDownloadLink.prototype.register,
    trigger: RasterDownloadLink.prototype.trigger,
    getUrl: RasterDownloadLink.prototype.getUrl,

    onLayerChange: function (lyr_id) {
        var dst, url, reg, matches;
        if (lyr_id === undefined) {
            lyr_id = this.layer.params.LAYERS;
        }
        dst = lyr_id.split('/')[0];
        this.varname = lyr_id.split('/')[1];
        url = this.catalog[dst];
        reg = new RegExp(pdp.data_root + '/(.*)/(.*)');
        matches = reg.exec(url);
        //matches[1] is portal url base, matches[2] is dataset, make catalog URL.
        url = pdp.app_root + "/" + matches[1] + "/catalog/" + matches[2];
        this.dl_url = url;
        this.trigger();
    }
    // Register for changes with the ncwms layer
};


condExport(module, {
    setCfTimeSystemMessages: setCfTimeSystemMessages,
    setDatepicker: setDatepicker,
    getDateRange: getDateRange,
    processDateRangeInput: processDateRangeInput,
    generateMenuTree: generateMenuTree,
    getRasterAccordionMenu: getRasterAccordionMenu,
    isArchivePortal: isArchivePortal,
    getArchiveDisclaimer: getArchiveDisclaimer,
    addPortalLink: addPortalLink,
    getRasterControls: getRasterControls,
    getRasterDownloadOptions: getRasterDownloadOptions,
    round: round,
    Colorbar: Colorbar,
    RasterDownloadLink: RasterDownloadLink,
    MetadataDownloadLink: MetadataDownloadLink,
});
