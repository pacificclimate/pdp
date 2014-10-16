function getDateRange() {
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

    return rangeDiv;
}

function generateMenuTree(subtree, leafNameMapping) {
    var ul = $("<ul/>")
    $.each(Object.keys(subtree), function(index, stuff) {
        var li = $('<li/>');
        if(subtree[stuff] instanceof Object) {
	    li.append($('<a/>').text(stuff)).append(generateMenuTree(subtree[stuff], leafNameMapping));
        } else {
            var newlayer = subtree[stuff] + "/" + stuff;
	    var linkText = stuff;
	    if(typeof leafNameMapping != 'undefined')
		linkText = leafNameMapping[stuff];

            li.attr('id', newlayer);
            $('<a/>').text(linkText).click(function() {
                ncwms.params.LAYERS = newlayer;
                ncwms.events.triggerEvent('change', newlayer);
                //ncwms.redraw();
                //$('#map-title').html(newlayer + '<br />' + ncwms.params.TIME);
                current_dataset = newlayer;
                processNcwmsLayerMetadata(ncwms);
            }).addClass('menu-leaf').appendTo(li);
        }
        li.appendTo(ul);
    });
    return ul;
}

function getRasterAccordionMenu(ensembleName, leafNameMapping) {
    var divId = "dataset-menu";
    var div = pdp.createDiv(divId);
    var url = '../menu.json?ensemble_name=' + ensembleName
    $.ajax(url, {dataType: "json"}).done(function(data) {
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

var getRasterControls = function(ensemble_name) {
    var div = pdp.createDiv('', 'control');
    var form = pdp.createForm(undefined, undefined, undefined);
    var fieldset = pdp.createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
};

var getRasterDownloadOptions = function (include_dates_selection) {
    var frag = document.createDocumentFragment();
    var div = frag.appendChild(pdp.createDiv('', 'control'));
    var downloadForm = div.appendChild(pdp.createForm("download-form", "download-form", "get"));
    var downloadFieldset = downloadForm.appendChild(pdp.createFieldset("downloadset", "Download Data"));
    if (include_dates_selection) {
        downloadFieldset.appendChild(getDateRange());
    }
    downloadFieldset.appendChild(createRasterFormatOptions());
    downloadFieldset.appendChild(createDownloadButtons("download-buttons", "download-buttons", {"download-timeseries": "Download", "metadata": "Metadata", "permalink": "Permalink"}));
    return frag;
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

};


// FIXME: We cannot use layer.params.* for anything if we want the event handling to be order agnostic
Colorbar.prototype = {
    constructor: Colorbar,

    get midpoint() {
        if (this.layer.params.LOGSCALE) {
	    var min = this.minimum <= 0 ? 1 : this.minimum;
            return Math.exp((Math.log(this.maximum) - Math.log(min)) / 2);
        } else {
            return (this.minimum + this.maximum) / 2;
        }
    },

    graphic_url: function() {
	var palette = this.layer.params.STYLES.split('/')[1];
        return pdp.ncwms_url + "?REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=1" +
            "&HEIGHT=300" +
            "&PALETTE=" + palette +
            "&NUMCOLORBANDS=254";
    },    

    metadata_url: function(lyr_id) {
	if (lyr_id === undefined) {
	    lyr_id = this.layer.params.LAYERS;
	}

	return "../metadata.json?request=GetMinMaxWithUnits" +
            "&id=" + lyr_id.split('/')[0] +
            "&var=" + lyr_id.split('/')[1];

    },

    format_units: function(units) {
        // reformat known units:
        // 'mm d-1', '%', 'days', 'meters s-1', 'm', 'mm',
        // 'degrees_C', 'kg m-2', 'degC', 'mm day-1', 'celsius'
        switch(units) {
            case "degC":
            case "degrees_C":
            case "celsius":
                return "&#8451;"
            case "mm d-1":
            case "mm day-1":
                return "mm/day";
            case "meters s-1":
                return "m/s";
            case "kg m-2":
                return "kg/m<sup>2</sup>";
                break;
            default:
                return units;
        }
    },

    refresh_values: function(lyr_id) {
        var url = this.metadata_url(lyr_id),
            request = $.ajax({
                url: url,
                context: this
            });

        var promise = request.done(function( data ) {
            this.minimum = data.min;
            this.maximum = data.max;
            this.units = this.format_units(data.units);
            this.redraw();
        });
	return promise;
    },
    redraw: function() {
        var div = $("#" + this.div_id);
        div.css('background-image', "url(" + this.graphic_url() + ")");
        div.find("#minimum").html(round(this.minimum) + " " + this.units);
        div.find("#maximum").html(round(this.maximum) + " " + this.units);
        div.find("#midpoint").html(round(this.midpoint) + " " + this.units);
    }
};

var round = function(number) {
    return Math.round(number * 100) / 100;
};

