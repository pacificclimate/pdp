function getClipCheckbox() {
    return pdp.getCheckbox('cliptodate', undefined, 'cliptodate', 'cliptodate', 'Clip time series to filter date range');
}

function createDownloadButtons(id, divClass, buttons) {
    var downloadDiv = pdp.createDiv(id);
    downloadDiv.className = divClass;
    $.each(buttons, function(idx, val) {
	downloadDiv.appendChild(pdp.createInputElement("submit", undefined, idx, idx, val))
	downloadDiv.appendChild(document.createTextNode(" "));
    });
    return downloadDiv;
}

function getCRMPDownloadOptions() {
    var frag = document.createDocumentFragment();
    var div = frag.appendChild(pdp.createDiv('', 'control'));
    var downloadForm = div.appendChild(pdp.createForm("download-form", "download-form", "get", pdp.app_root + "/auth/agg/"));
    var downloadFieldset = downloadForm.appendChild(pdp.createFieldset("downloadset", "Download Data"));
    downloadFieldset.appendChild(createFormatOptions());
    downloadFieldset.appendChild(getClipCheckbox());
    downloadFieldset.appendChild(createDownloadButtons('download-buttons', 'download-buttons', {'download-climatology': 'Climatology', 'download-timeseries': 'Timeseries' }));

    var nodelistDiv = frag.appendChild(pdp.createDiv("nodelist"));
    var metadataForm = pdp.createForm('metadata-form', 'metadata-form', 'post');
    var metadataFieldset = pdp.createFieldset("metadataset");
    metadataFieldset.appendChild(createMetadataFormatOptions());
    metadataFieldset.appendChild(createDownloadButtons('metadata-buttons', 'download-buttons', {'download-meta': 'Download'}));
    metadataForm.appendChild(metadataFieldset);
    nodelistDiv.appendChild(metadataForm);

    return frag;
}
