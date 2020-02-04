/*jslint browser: true, devel: true */
/*global $, jQuery, pdp*/

"use strict";

function show_permalinks(base_urls, extension) {
	console.log("inside show_permalinks");
	console.log(base_urls);
    var url_list, d, p;
    url_list = $.map(base_urls, function (url) {
        return url + "." + extension;
    });
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
