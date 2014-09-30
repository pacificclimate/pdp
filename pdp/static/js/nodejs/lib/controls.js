// pdp controls library

/*jshint browser: true*/
/* global $, pdp */

"use strict";

var dom = require("./dom.js");
var download = require("./download.js");

var getDateRange = function() {
    var rangeDiv = dom.createDiv("date-range");
    rangeDiv.appendChild(dom.createLabel("date-range-label", "Date Range", "date-range"));
    rangeDiv.appendChild(dom.createInputElement("text", "datepickerstart", "from-date", "from-date", "YYYY/MM/DD"));
    rangeDiv.appendChild(document.createTextNode(" to "));
    rangeDiv.appendChild(dom.createInputElement("text", "datepickerend", "to-date", "to-date", "YYYY/MM/DD"));
    rangeDiv.appendChild(dom.createInputElement("hidden", "", "input-polygon", "input-polygon", ""));

    $(".datepickerstart", rangeDiv).datepicker({
        inline: true,
        dateFormat: "yy/mm/dd",
        changeMonth: true,
        changeYear: true,
        yearRange: "1870:cc",
	defaultDate: "1870/01/01"
    });
    $(".datepickerend", rangeDiv).datepicker({
            inline: true,
            dateFormat: "yy/mm/dd",
            changeMonth: true,
            changeYear: true,
            yearRange: "1870:cc",
	    defaultDate: "cc"
        });

    return rangeDiv;
};
exports.getDateRange = getDateRange;

var generateMenuTree = function(subtree, leafNameMapping) {
    var ul = $("<ul/>");
    $.each(Object.keys(subtree), function(index, stuff) {
        var li = $("<li/>");
        if(subtree[stuff] instanceof Object) {
            li.append($("<a/>").text(stuff)).append(generateMenuTree(subtree[stuff], leafNameMapping));
        } else {
            var newlayer = subtree[stuff] + "/" + stuff;
            var linkText = stuff;
            if(typeof leafNameMapping !== "undefined") {
                linkText = leafNameMapping[stuff];
            }

            li.attr("id", newlayer);
            $("<a/>").text(linkText).click(function() {
                pdp.ncwms.params.LAYERS = newlayer;
                pdp.ncwms.events.triggerEvent("change", newlayer);
                pdp.ncwms.redraw();
                $("#map-title").html(newlayer + "<br />" + pdp.ncwms.params.TIME);
                pdp.current_dataset = newlayer;
                download.processNcwmsLayerMetadata(pdp.ncwms);
            }).addClass("menu-leaf").appendTo(li);
        }
        li.appendTo(ul);
    });
    return ul;
};

var getRasterAccordionMenu = function(ensembleName, leafNameMapping) {
    var divId = "dataset-menu";
    var div = dom.createDiv(divId);
    var url = "../menu.json?ensemble_name=" + ensembleName;
    $.ajax(url, {dataType: "json"}).done(function(data) {
        var menu_tree = generateMenuTree(data, leafNameMapping);
        menu_tree.addClass("dataset-menu");
        $("#" + divId).html(menu_tree);
        $(".dataset-menu").accordion({
            accordion: true,
            speed: 200,
            closedSign: "[+]",
            openedSign: "[-]"
        });
    });
    return div;
};
exports.getRasterAccordionMenu = getRasterAccordionMenu;

var getRasterControls = function(ensemble_name) {
    var div = dom.createDiv("", "control");
    var form = dom.createForm(undefined, undefined, undefined);
    var fieldset = dom.createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu(ensemble_name));
    form.appendChild(fieldset);
    div.appendChild(form);
    return div;
};
exports.getRasterControls = getRasterControls;

var getRasterDownloadOptions = function(include_dates_selection) {
    var frag = document.createDocumentFragment();
    var div = frag.appendChild(dom.createDiv("", "control"));
    var downloadForm = div.appendChild(dom.createForm("download-form", "download-form", "get"));
    var downloadFieldset = downloadForm.appendChild(dom.createFieldset("downloadset", "Download Data"));
    if (include_dates_selection) {
        downloadFieldset.appendChild(getDateRange());
    }
    downloadFieldset.appendChild(download.createRasterFormatOptions());
    downloadFieldset.appendChild(download.createDownloadButtons("download-buttons", "download-buttons", {"download-timeseries": "Download", "metadata": "Metadata", "permalink": "Permalink"}));
    return frag;
};
exports.getRasterDownloadOptions = getRasterDownloadOptions;
