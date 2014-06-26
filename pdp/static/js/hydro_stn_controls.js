
function getHydroStnControls(map) {
    var div = pdp.createDiv('', 'control');
    var fieldset = pdp.createFieldset("filterset", "Selection");
    //fieldset.appendChild(getResetButton(map));
    div.appendChild(fieldset);
    return div;
}
