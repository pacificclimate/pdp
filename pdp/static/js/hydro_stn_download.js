var download_single = function(base_url, extension) {
    if (window.shittyIE) {
        alert("Downloads may not function completely correctly on IE <= 8. Cross your fingers and/or upgrade your browser.");
    }
    window.open(base_url + "." + extension, "_blank", "width=600,height=600");    
};

var show_permalinks = function(base_urls, extension) {
    var url_list = $.map(base_urls, function(url) {
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
};