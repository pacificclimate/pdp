/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, createSearchBox, createDownloadButtons*/

"use strict";

function createClearSelectionButton() {
    var container, button;
    container = pdp.createDiv();
    button = pdp.createInputElement("button", undefined, "reset", "reset", "Reset Selection");
    button.appendChild(document.createTextNode(" "));
    $(button).click(function () {
        map.unselectAll();
    });
    container.appendChild(button);
    return container;
}

function getHydroStnControls() {
    var frag, div, form, fieldset, sBox, selection, clear;

    frag = document.createDocumentFragment();

    div = pdp.createDiv('', 'control');
    frag.appendChild(div);

    form = pdp.createForm();
    $(form).submit(false);
    div.appendChild(form);

    fieldset = pdp.createFieldset("filterset", "Selection");
    form.appendChild(fieldset);

    sBox = createSearchBox("searchBox");
    fieldset.appendChild(sBox);
    frag.sBox = sBox;

    $(sBox).focus(function () {
        var input = $(this);
        if (input.val() === input.attr('placeholder')) {
            input.val('');
            input.removeClass('placeholder');
        }
    }).blur(function () {
        var input = $(this);
        if (input.val() === '' || input.val() === input.attr('placeholder')) {
            input.addClass('placeholder');
            input.val(input.attr('placeholder'));
        }
    }).blur();

    selection = pdp.createDiv('selectedStations', '');
    fieldset.appendChild(selection);

    clear = createClearSelectionButton();
    fieldset.appendChild(clear);

    return frag;
}

// Add an item from the Selection sidebar
function addToSidebar(idx, dataArray) {
    var item, close;
    item = pdp.createDiv('stnNo' + idx, '');
    close = item.appendChild(pdp.createDiv('', 'stn_remove'));
    close.textContent = "[X]";
    $(close).click(function () {
        map.toggleSelectFeatureByFid(idx);
    });
    item.appendChild(document.createTextNode(dataArray[idx].StationName));
    $('#selectedStations').append(item);
}

// Remove an item from the Selection sidebar
function removeFromSidebar(idx) {
    $('#stnNo' + idx).remove();
}

// Create a search box using jquery ui's autocomplete control.
function createSearchBox(id, cssClass, data, select_callback) {
    var sbox = pdp.createInputElement("text", cssClass, id, id, '');
    sbox.placeholder = "Station Name or ID";
    return sbox;
}

function createFormatOptions() {
    var formatData = {
        ascii: pdp.mkOpt('CSV/ASCII', 'CSV/ASCII response will return an OPeNDAP plain-text response which is a human readable array notation. For weather station data, the format normally consists of a sequence of fields separated by a comma and a space (e.g. " ,")'),
    };

    return pdp.getSelectorWithHelp('Output Format', 'data-format', 'data-format', 'data-format-selector', 'csv', formatData, 'View output format descriptions', 450, 450);
}

function getDownloadOptions() {
    var frag, div, downloadForm, downloadFieldset;

    frag = document.createDocumentFragment();
    div = frag.appendChild(pdp.createDiv('', 'control'));
    downloadForm = div.appendChild(pdp.createForm("download-form", "download-form", "get"));
    downloadFieldset = downloadForm.appendChild(pdp.createFieldset("downloadset", "Download Data"));
    downloadFieldset.appendChild(createFormatOptions());
    downloadFieldset.appendChild(createDownloadButtons("download-buttons", "download-buttons", {"download": "Download", "permalink": "Permalink"}));
    return frag;
}
