
function getHydroStnControls() {
    var frag = document.createDocumentFragment();

    var div = pdp.createDiv('', 'control');
    frag.appendChild(div);

    var form = pdp.createForm("download-form", "download-form");
    $(form).submit(false);
    div.appendChild(form);

    var fieldset = pdp.createFieldset("filterset", "Selection");
    form.appendChild(fieldset);

    var sBox = createSearchBox("searchBox")
    fieldset.appendChild(sBox);
    frag.sBox = sBox;

    $(sBox).focus(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
            input.val('');
            input.removeClass('placeholder');
        }
    }).blur(function() {
        var input = $(this);
        if (input.val() == '' || input.val() == input.attr('placeholder')) {
            input.addClass('placeholder');
            input.val(input.attr('placeholder'));
        }
    }).blur();

    var selection = pdp.createDiv('selectedStations', '');
    fieldset.appendChild(selection);

    return frag;
}

// Add an item from the Selection sidebar
var addToSidebar = function(idx, dataArray) {
    var item = pdp.createDiv('stnNo' + idx, '');
    item.textContent = dataArray[idx].StationName;
    $('#selectedStations').append(item);
};

// Remove an item from the Selection sidebar
var removeFromSidebar = function(idx) {
    $('#stnNo' + idx).remove();
};

// Create a search box using jquery ui's autocomplete control.
var createSearchBox = function(id, cssClass, data, select_callback) {
    var sbox = pdp.createInputElement("text", cssClass, id, id, '');
    sbox.placeholder = "Station Name or ID"
    return sbox;
};
