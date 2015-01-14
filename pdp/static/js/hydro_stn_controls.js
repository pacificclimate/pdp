/*jslint browser: true, devel: true */
/*global $, jQuery, OpenLayers, pdp, map, createSearchBox, createDownloadButtons*/

"use strict";

function createClearSelectionButton() {
    var button;
    button = pdp.createInputElement("button", undefined, "reset", "reset", "Reset Selection");
    button.appendChild(document.createTextNode(" "));
    $(button).click(function () {
        map.unselectAll();
    });
    return button;
}

function getHydroStnControls() {
    var frag, div, form, fieldset, sBox, selection, clear, container, permalink;

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

    container = pdp.createDiv();

    clear = createClearSelectionButton();
    container.appendChild(clear);

    container.appendChild(document.createTextNode(" "));

    permalink = pdp.createInputElement("button", undefined, "permalink", "permalink", "Permalink");
    container.appendChild(permalink);

    fieldset.appendChild(container);

    return frag;
}

// Add an item from the Selection sidebar
function addToSidebar(idx, dataArray) {
    var item, close, link;
    item = pdp.createDiv('stnNo' + idx, '');
    close = item.appendChild(pdp.createDiv('', 'stn_remove'));
    close.textContent = "[X]";
    $(close).click(function () {
        map.toggleSelectFeatureByFid(idx);
    });

    link = document.createElement('a');
    link.href = "../data/" + dataArray[idx].FileName + '.ascii';
    link.text = dataArray[idx].StationName;

    item.appendChild(link);

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
