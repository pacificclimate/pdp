
function getHydroStnControls(map) {
    var div = pdp.createDiv('', 'control');
    var fieldset = pdp.createFieldset("filterset", "Selection");
    var selection = pdp.createDiv('selectedStations', '');
    //fieldset.appendChild(getResetButton(map));
    fieldset.appendChild(selection);
    div.appendChild(fieldset);
    return div;
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
    var frag = document.createDocumentFragment();
    var elem = frag.appendChild(pdp.createInputElement("text", cssClass, id, id, ''));
    $(elem).autocomplete({
        source: data,
        select: select_callback,
        delay: 100,
        minLength: 2
    });
    return frag;
};

// Toggle whether an index into the data array is selected.
var toggleIdxSelection = function(idx, icon, selectionList, dataArray) {
    var stnLayer = map.getLayersByName("Stations")[0];

    if(idx in selectionList) {
        icon.setUrl(pdp.app_root + "/images/mini_triangle.png");
        delete selectionList[idx];
        removeFromSidebar(idx);
    } else {
        icon.setUrl(pdp.app_root + "/images/mini_triangle_selected.png");
        selectionList[idx] = dataArray[idx];
        addToSidebar(idx, dataArray);
    }
    stnLayer.redraw();
};