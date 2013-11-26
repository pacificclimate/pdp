function getDateRange() {
    var rangeDiv = createDiv("date-range");
    rangeDiv.appendChild(createLabel("date-range-label", "Date Range", "date-range"));
    rangeDiv.appendChild(createInputElement("text", "datepickerstart", "from-date", "from-date", "YYYY/MM/DD"));
    rangeDiv.appendChild(document.createTextNode(" to "));
    rangeDiv.appendChild(createInputElement("text", "datepickerend", "to-date", "to-date", "YYYY/MM/DD"));
    rangeDiv.appendChild(createInputElement("hidden", "", "input-polygon", "input-polygon", ""));

    $('.datepickerstart', rangeDiv).datepicker({
        inline: true,
        dateFormat: 'yy/mm/dd',
        changeMonth: true,
        changeYear: true,
        yearRange: '1870:cc',
	defaultDate: '1870/01/01'
    });
    $('.datepickerend', rangeDiv).datepicker({
            inline: true,
            dateFormat: 'yy/mm/dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '1870:cc',
	    defaultDate: 'cc'
        });

    return rangeDiv;
}

function generateMenuTree(subtree) {
    var ul = $("<ul/>")
    $.each(Object.keys(subtree), function(index, stuff) {
        var li = $('<li/>');
        if(subtree[stuff] instanceof Object) {
            li.append($('<a/>').text(stuff)).append(generateMenuTree(subtree[stuff]));
        } else {
            var newlayer = subtree[stuff] + "/" + stuff;
            li.attr('id', newlayer);
            $('<a/>').text(stuff).click(function() {
                ncwms.params.LAYERS = newlayer;
                ncwms.redraw();
                $('#map-title').text(newlayer);
                current_dataset = newlayer;
                processNcwmsLayerMetadata(ncwms);
            }).appendTo(li);
        }
        li.appendTo(ul);
    });
    return ul;
}

function getRasterAccordionMenu(ensembleName) {
    var divId = "dataset-menu";
    var div = createDiv(divId);
    var url = app_root + '/' + ensembleName + '/menu.json?ensemble_name=' + ensembleName
    $.ajax(url, {dataType: "json"}).done(function(data) {
        var menu_tree = generateMenuTree(data);
        menu_tree.addClass("dataset-menu");
        $("#" + divId).html(menu_tree);
        $(".dataset-menu").accordion({
            accordion: true,
            speed: 200,
            closedSign: '[+]',
            openedSign: '[-]'
        });
    });
    return div;
}

