
function getHydroStnControls(map) {
    var div = pdp.createDiv('', 'control');
    var fieldset = pdp.createFieldset("filterset", "Selection");
    var selection = pdp.createDiv('selectedStations', '');
    //fieldset.appendChild(getResetButton(map));
    fieldset.appendChild(selection);
    div.appendChild(fieldset);
    return div;
}
