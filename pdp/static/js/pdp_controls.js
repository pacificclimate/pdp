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


function getRasterAccordionMenu(ensembleName) {
    var divId = "acdnmenu";
    return createAJAXAccordionMenu(divId, 'http://tools.pacificclimate.org/data_portal/' + '/ensemble_datasets.json?ensemble_name=' + ensembleName);
}

