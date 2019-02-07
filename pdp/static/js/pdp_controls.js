/*jslint browser: true, devel: true */
/*global $, jQuery, createRasterFormatOptions, createDownloadLink, getRasterNativeProj, ncwmsCapabilities, getRasterBbox, rasterBBoxToIndicies, intersection, getTimeSelected*/
"use strict";

// globals
var pdp, ncwms, map;

function getDateRange(omitFullTimeCheckbox) {
    var omitFullTimeCheckbox = (typeof omitFullTimeCheckbox !== 'undefined') ? omitFullTimeCheckbox : false;
    
    var rangeDiv = pdp.createDiv("date-range");
    rangeDiv.appendChild(pdp.createLabel("date-range-label", "Date Range", "date-range"));
    rangeDiv.appendChild(pdp.createInputElement("text", "datepickerstart", "from-date", "from-date", "YYYY/MM/DD"));
    rangeDiv.appendChild(document.createTextNode(" to "));
    rangeDiv.appendChild(pdp.createInputElement("text", "datepickerend", "to-date", "to-date", "YYYY/MM/DD"));
    rangeDiv.appendChild(pdp.createInputElement("hidden", "", "input-polygon", "input-polygon", ""));

    $('.datepickerstart', rangeDiv).datepicker({
        inline: true,
        dateFormat: 'yy/mm/dd',
        changeMonth: true,
        changeYear: true,
        yearRange: '1870:cc',
        defaultDate: '1870/01/01'
    });
    $('.datepickerend', rangeDiv).datepicker({
        inline: true,
        dateFormat: 'yy/mm/dd',
        changeMonth: true,
        changeYear: true,
        yearRange: '1870:cc',
        defaultDate: 'cc'
    });

    if (!omitFullTimeCheckbox) {
        var checkboxDiv = pdp.createDiv("download-all-time");
        checkboxDiv.appendChild(pdp.createInputElement("checkbox", undefined, "download-full-timeseries", "download-full-timeseries", undefined));
        checkboxDiv.appendChild(pdp.createLabel(undefined, "Download Full Timeseries", "download-full-timeseries"));
        rangeDiv.appendChild(checkboxDiv);

        // Specify full timeseries download by setting to min/max dates
        $("#pdp-controls").on("change", "#download-full-timeseries", function(evt) {
                if (this.checked) {
                    $("#from-date").datepicker('disable').addClass("disabled").datepicker("setDate", $("#from-date").datepicker("option", "minDate"));
                    $("#to-date").datepicker('disable').addClass("disabled").datepicker("setDate", $("#to-date").datepicker("option", "maxDate"));
                    // Trigger event to call dlLink.onTimeChange()
                    $("[class^='datepicker']").trigger("change");
                } else {
                    $("#from-date").datepicker('enable').removeClass("disabled");
                    $("#to-date").datepicker('enable').removeClass("disabled");
                }
            }
        );
    }

    return rangeDiv;
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
    var divId = "dataset-menu",
        div = pdp.createDiv(divId),
        url = '../menu.json?ensemble_name=' + ensembleName;
    $.ajax(url, {dataType: "json"}).done(function (data) {
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

function getArchiveDisclaimer() {
  const disText = "These methods are provided for research / comparison to older analysis purposes only, and caution with their use is advised.";
  return pdp.createLabel("disclaimer", disText);
}

var getRasterControls = function (ensemble_name) {
    var div = pdp.createDiv('', 'control'),
        form = pdp.createForm(undefined, undefined, undefined),
        fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
};

var getRasterDownloadOptions = function (include_dates_selection) {
    var frag = document.createDocumentFragment(),
        div = frag.appendChild(pdp.createDiv('', 'control')),
        downloadForm = div.appendChild(pdp.createForm("download-form", "download-form", "get")),
        downloadFieldset = downloadForm.appendChild(pdp.createFieldset("downloadset", "Download Data"));
    if (include_dates_selection) {
        downloadFieldset.appendChild(getDateRange());
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
        var url = this.metadata_url(lyr_id),
            request = $.ajax({
                url: url,
                context: this
            });

        request.done(function (data) {
            this.minimum = data.min;
            this.maximum = data.max;
            this.units = this.format_units(data.units);
            this.redraw();
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
        var start, end;

        start = $(".datepickerstart").datepicker("getDate");
        start = this.layer.times.toIndex(start);
        end = $(".datepickerend").datepicker("getDate");
        end = this.layer.times.toIndex(end);

        //if either start or end is undefined, fall back to the full time range
        start = start === undefined ? 0 : start;
        end = end === undefined ? "" : end;

        this.trange = start + ':' + end;
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
