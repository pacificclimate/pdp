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

    // Create search box control/form
    div = pdp.createDiv('', 'control');
    frag.appendChild(div);

    form = pdp.createForm();
    $(form).submit(false);
    div.appendChild(form);

    fieldset = pdp.createFieldset("filterset", "Station Search");
    form.appendChild(fieldset);

    sBox = createSearchBox("searchBox");
    fieldset.appendChild(sBox);
    frag.sBox = sBox; // sBox must be accessible through frag

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

    // Create download links control
    div = pdp.createDiv('', 'control');
    frag.appendChild(div);
    fieldset = pdp.createFieldset("filterset", "Downoad Links");
    div.appendChild(fieldset)
    selection = pdp.createDiv('selectedStations', '');
    fieldset.appendChild(selection);

    var placeholder = pdp.createDiv('stn_placeholder', '');
    placeholder.textContent = "None yet. Click or search for stations";
    placeholder.style.color = 'grey';
    selection.appendChild(placeholder);

    // Station listing container
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
function addToSidebar(idx, dataArray, loginButton) {
    var item, close, link;

    var placeholder = document.getElementById('stn_placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    item = pdp.createDiv('stnNo' + idx, '');
    close = item.appendChild(pdp.createDiv('', 'stn_remove'));
    close.textContent = "[X]";
    $(close).click(function () {
        map.toggleSelectFeatureByFid(idx);
    });

    link = document.createElement('a');
    link.href = "../../data/hydro_stn/" + dataArray[idx].FileName + '.ascii';
    link.text = dataArray[idx].StationName;
    $(link).click(loginButton, pdp.checkAuthBeforeDownload);
    item.appendChild(link);

    $('#selectedStations').append(item);
}

// Remove an item from the Selection sidebar
function removeFromSidebar(idx) {
    $('#stnNo' + idx).remove();
    if ($('#selectedStations > *').length < 1) {
        var placeholder = pdp.createDiv('stn_placeholder', '');
        placeholder.textContent = "None yet. Click or search for stations";
        placeholder.style.color = 'grey';
        $('#selectedStations').append(placeholder);
    };
}

// Create a search box using jquery ui's autocomplete control.
function createSearchBox(id, cssClass, data, select_callback) {
    var sbox = pdp.createInputElement("text", cssClass, id, id, '');
    sbox.placeholder = "Station Name or ID";
    return sbox;
}
