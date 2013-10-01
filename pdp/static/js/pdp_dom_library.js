function curry( fn /*, ... */) { 
    var curryArgs = Array.prototype.slice.call( arguments, 1 ); 
    return function( /* ... */ ) { 
	var newArgs = Array.prototype.slice.call( arguments, 0 ), mergedArgs = curryArgs.concat( newArgs ); 
	return fn.apply( this, mergedArgs ); 
    } 
}

function createInputElement(type, cssClass, id, name, value) {
    var ie = document.createElement("input");
    ie.type = type;
    if(typeof cssClass != 'undefined') ie.className = cssClass;
    if(typeof id != 'undefined') ie.id = id;
    ie.name = name;
    if(typeof value != 'undefined') ie.value = value;
    return ie;
}

function createTextarea(id, value, readonly) {
    var ta = document.createElement('textarea');
    ta.id = id;
    if(typeof value != 'undefined') ta.value = value;
    if(typeof readonly != 'undefined') ta.readonly = 'readonly';
    return ta;
}

function createDiv(id) {
    var div = document.createElement("div");
    div.id = id;
    return div;
}

function createLabel(id, text, forId) {
    var label = document.createElement("label");
    label.id = id;
    label.appendChild(document.createTextNode(text));
    label.htmlFor = forId;
    return label;
}

function createLegend(id, text) {
    var legend = document.createElement("legend");
    legend.id = id;
    legend.appendChild(document.createTextNode(text));
    return legend;
}

function createForm(id, name, method, action) {
    var form = document.createElement("form");
    if(typeof id != 'undefined') form.id = id;
    if(typeof name != 'undefined') form.name = name;
    if(typeof method != 'undefined') form.method = method;
    if(typeof action != 'undefined') form.action = action;
    return form;
}

function createFieldset(id, label) {
    var fieldset = document.createElement("fieldset");
    fieldset.id = id;
    if (typeof label != 'undefined')
	fieldset.appendChild(createLegend(id + "-legend", label));
    return fieldset;
}

function createOption(val, text, selected) {
    var option = document.createElement("option");
    option.appendChild(document.createTextNode(text));
    option.value = val;
    if(typeof selected != 'undefined') option.selected=selected;
    return option;
}

function createOptgroup(label, options) {
    var optgroup = document.createElement("optgroup");
    optgroup.label = label;
    optgroup.appendChild(options);
    return optgroup;
}

function getOptionsRecursive(vals, defaultValue) {
    var frag = document.createDocumentFragment();
    $.each(vals, function(idx, val) {
	if($.isArray(val)) {
	    frag.appendChild(createOptgroup(idx, getOptionsRecursive(val[0], defaultValue)));
	} else
	    if(typeof defaultValue != 'undefined' && idx == defaultValue) {
		frag.appendChild(createOption(idx, val.name, "selected"));
	    } else {
		frag.appendChild(createOption(idx, val.name));
	    }
	return true;
    });
    return frag;
}

function createSelect(id, name, vals, defaultValue) {
    var select = document.createElement("select");
    select.name = name;
    if(typeof id != 'undefined') select.id = id;
    var ret = getOptionsRecursive(vals, defaultValue);
    select.appendChild(ret);
    return select;
}

function createLink(id, title, href, text, name) {
    var link = document.createElement("a");
    if(typeof id != 'undefined') link.id = id;
    if(typeof title != 'undefined') link.title = title;
    if(typeof href != 'undefined') link.href = href;
    if(typeof name != 'undefined') link.name = name;
    link.appendChild(document.createTextNode(text));
    return link;
}

function createHelpLink(linkId, linkTitle) {
    var span = document.createElement("span");
    span.className = 'helplink';
    span.appendChild(createLink(linkId, linkTitle, '#', '[?]'));
    return span;
}

function createHelpItem(name, description) {
    var frag = document.createDocumentFragment();
    var dt = document.createElement("dt");
    var dd = document.createElement("dd");
    dt.appendChild(document.createTextNode(name));
    dd.appendChild(document.createTextNode(description));
    frag.appendChild(dt);
    frag.appendChild(dd);
    return frag;
}

function createHelpGroup(name, subtree, depth) {
    var frag = document.createDocumentFragment();
    var header = document.createElement('h' + depth);
    header.appendChild(document.createTextNode(name));
    frag.appendChild(header);
    frag.appendChild(subtree);
    return frag;
}

function getHelpRecursive(vals, depth) {
    var frag = document.createDocumentFragment();
    $.each(vals, function(idx, val) {
	if($.isArray(val))
	    frag.appendChild(createHelpGroup(idx, getHelpRecursive(val[0]), depth + 1));
	else
	    if(typeof val.help != 'undefined')
		frag.appendChild(createHelpItem(val.name, val.help));
	return true;
    });
    
    return frag;
}

function createHelp(helpDivId, helpData, title, width, height, helpElementType, helpCallback) {
    if(typeof helpElementType == 'undefined') helpElementType = 'dl';
    if(typeof helpCallback == 'undefined') helpCallback = getHelpRecursive;
    var div = createDiv(helpDivId);
    var frag = document.createDocumentFragment();
    var parent_elem = div.appendChild(document.createElement(helpElementType));
    parent_elem.appendChild(helpCallback(helpData, 2));

    $(div).dialog({
	appendTo: $(frag),
    	autoOpen: false,
    	title: title,
    	width: width,
    	height: height,
    	buttons: {
    	    "Close": function() {
    		$(this).dialog("close");
    	    }
    	}
    });
    
    return frag;
}

function getTextareaLabeled(id, label, value, readonly) {
    var frag = document.createDocumentFragment();
    frag.appendChild(createLabel(id + "-label", label, id));
    var ta = frag.appendChild(createTextarea(id, value, readonly));
    return frag;
}

function getSelector(prettyName, divId, selectName, selectId, defaultValue, data) {
    var div = createDiv(divId);
    div.appendChild(createLabel(divId + "-label", prettyName, divId));
    div.appendChild(createSelect(selectId, selectName, data, defaultValue));
    return div;
}

function getCheckbox(divId, cbId, cbName, cbValue, cbLabel) {
    var div = createDiv(divId);
    div.appendChild(createInputElement('checkbox', undefined, cbId, cbName, cbValue));
    div.appendChild(createLabel(cbId + '-label', cbLabel, cbId));
    return div;
}

function getSelectorWithHelp(prettyName, divId, selectName, selectId, defaultValue, data, helpLinkTooltip, helpWidth, helpHeight, helpElementType, helpCallback) {
    var div = getSelector(prettyName, divId, selectName, selectId, defaultValue, data);
    var helpDivId = divId + "-help";
    var helpLinkId = helpDivId + "-link";
    div.appendChild(createHelpLink(helpLinkId, helpLinkTooltip));
    div.appendChild(createHelp(helpDivId, data, prettyName, helpWidth, helpHeight, helpElementType, helpCallback));

    $('#' + helpLinkId, div).click(function() {
        $('#' + helpDivId).dialog('open');
        return false;
    });

    return div;
}

function mkOpt(name, help) {
    return { name: name, help: help };
}

function mkOptGroup(opts) {
    return [opts];
}

