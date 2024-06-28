/*jslint browser: true, devel: true */
/*global $, jQuery, pdp*/

"use strict";

function show_permalinks(url_list) {
    var d, p;
    d = pdp.createDiv("permalink-dialog");
    p = d.appendChild(document.createElement("p"));
    p.appendChild(document.createTextNode(url_list.join("\n")));
    $('body').append(d);
    $(d).dialog({
        title: "Permalinks",
        // width: "auto",
        modal: true,
        width: 650,
    });
}

condExport(module, {
    show_permalinks: show_permalinks,
});
