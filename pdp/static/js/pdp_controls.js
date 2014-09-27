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
                ncwms.redraw();
                $('#map-title').html(newlayer + '<br />' + ncwms.params.TIME);
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
// var style = {position: "absolute",
//              width: "100px",
//              height: "500px",
//              color: "white",
//              "font-weight": "bold",
//              opacity: ".75",
//              border: "2px solid black",
//              right: "0px",
//              top: "100px",
//             };

// $("#map-wrapper").append('<div id="colorbar"/>');
// $('#colorbar').css(style);

// var cb = new Colorbar("colorbar", "http://localhost/ncwms/", "tmax_monClim_PRISM_historical_run1_197101-200012%2Ftmax", "ferret");
// cb.refresh_values();

function Colorbar(div_id, ncwms_url, layer_name, palette) {
    this.div_id = div_id;
    this.ncwms_url = ncwms_url;
    this.layer_name = layer_name;
    this.palette = palette;
    this.minimum = 5.7324;
    this.maximum = 15.2222222;

    // create the elements
    $("#" + div_id).html('<div id="minimum"></div><div id="midpoint"></div><div id="maximum"></div>');
    $('#minimum').css({ position: "absolute", top: "0px", left: "50px"});
    $('#midpoint').css({ position: "absolute", top: "250px", left: "50px"});
    $('#maximum').css({ position: "absolute", bottom: "0px", left: "50px"});
};


Colorbar.prototype = {
    constructor: Colorbar,

    get midpoint() {return (this.minimum + this.maximum) / 2;},

    graphic_url: function() {
        return this.ncwms_url + "wms?REQUEST=GetLegendGraphic&COLORBARONLY=true&WIDTH=1" +
            "&HEIGHT=500" + 
            "&PALETTE=" + this.palette +
            "&NUMCOLORBANDS=254";
    },    

    //$.ajax('http://medusa.pcic.uvic.ca:8080/ncWMS/wms?LAYERS=bcprism_tmax_7100%2Ftmax&ELEVATION=0&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMetadata&FORMAT=image%2Fpng&SRS=EPSG%3A4326&BBOX=-140,48,-113,61.991666666667&WIDTH=256&HEIGHT=256&item=minmax')
    //$.ajax('http://medusa.pcic.uvic.ca:8080/ncWMS/wms?REQUEST=GetMetadata&LAYERS=bcprism_tmax_7100/tmax&item=minmax&SRS=EPSG:4326&bbox=-140.00000000000034,47.99999999999997,-112.99999999999966,61.99166666666663&width=100&height=100');
    metadata_url: function() {
	// FIXME: how do we set these programatically and what effect do they actually have?
        var bbox = "-140.00000000000034,47.99999999999997,-112.99999999999966,61.99166666666663",
        width = "100",
        height = "100";
        
        return this.ncwms_url + "wms?REQUEST=GetMetadata" +
            "&LAYERS=" + this.layer_name +
            "&item=minmax" +
            "&SRS=EPSG:4326" +
            "&bbox=" + bbox +
            "&width=" + width +
            "&height=" + height;
    },
    refresh_values: function() {
        var url = this.metadata_url(),
        request = $.ajax({
            url: url,
            context: this
        });
	
        request.done(function( data ) {
            this.minimum = data.min;
            this.maximum = data.max;
            this.redraw();
        });
    },
    redraw: function() {
        var div = $("#" + this.div_id);
        div.css('background-image', "url(" + this.graphic_url() + ")");
        div.find("#minimum").html(round(this.minimum));
        div.find("#maximum").html(round(this.maximum));
        div.find("#midpoint").html(round(this.midpoint));
    }
};

var round = function(number) {
    return Math.round(number * 100) / 100;
};

