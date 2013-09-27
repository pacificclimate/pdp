function getRasterControls() {
	var form = createForm(undefined, undefined, undefined);
    var fieldset = createFieldset("filterset", "Dataset Selection");
    fieldset.appendChild(getRasterAccordionMenu('canada_map'));
    form.appendChild(fieldset);
    return form;
}

function getRasterDownloadOptions() {
    var frag = document.createDocumentFragment();
    var downloadForm = frag.appendChild(createForm("download-form", "download-form", "get"));
    var downloadFieldset = downloadForm.appendChild(createFieldset("downloadset", "Download Data"));
    downloadFieldset.appendChild(createRasterFormatOptions());
    downloadFieldset.appendChild(createDownloadButtons('download-buttons', 'download-buttons', {'download-timeseries': 'Timeseries' }));
    return frag;
}