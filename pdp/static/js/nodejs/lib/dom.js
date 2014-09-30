// pdp dom library

/*jshint browser: true*/
/* global $ */

"use strict";

var curry = function ( fn /*, ... */) {
    var curryArgs = Array.prototype.slice.call( arguments, 1 );
    return function( /* ... */ ) {
        var newArgs = Array.prototype.slice.call( arguments, 0 )
          , mergedArgs = curryArgs.concat( newArgs );
        return fn.apply( this, mergedArgs );
    };
};
exports.curry = curry;

var createInputElement = function (type, cssClass, id, name, value) {
    var ie = document.createElement("input");
    ie.type = type;
    if(typeof cssClass !== "undefined") { ie.className = cssClass; }
    if(typeof id !== "undefined") { ie.id = id; }
    if(typeof name !== "undefined") { ie.name = name; }
    if(typeof value !== "undefined") { 
        ie.value = value;
        ie.defaultValue = value;
    }
    return ie;
};
exports.createInputElement = createInputElement;

var createTextarea = function (id, value, readonly) {
    var ta = document.createElement("textarea");
    if(typeof id !== "undefined") { ta.id = id; }
    if(typeof value !== "undefined") {
        ta.value = ta.defaultValue = value;
    }
    if(typeof readonly !== "undefined") { ta.readonly = "readonly"; }
    return ta;
};
exports.createTextarea = createTextarea;

var createDiv = function (id, className) {
    var div = document.createElement("div");
    if(typeof id !== "undefined") { div.id = id; }
    if(typeof className !== "undefined") { div.className = className; }
    return div;
};
exports.createDiv = createDiv;

var createLabel = function (id, text, forId) {
    var label = document.createElement("label");
    if(typeof id !== "undefined") { label.id = id; }
    label.appendChild(document.createTextNode(text));
    label.htmlFor = forId;
    return label;
};
exports.createLabel = createLabel;

var createLegend = function (id, text) {
    var legend = document.createElement("legend");
    if(typeof id !== "undefined") { legend.id = id; }
    legend.appendChild(document.createTextNode(text));
    return legend;
};
exports.createLegend = createLegend;

var createForm = function (id, name, method, action) {
    var form = document.createElement("form");
    if(typeof id !== "undefined") { form.id = id; }
    if(typeof name !== "undefined") { form.name = name; }
    if(typeof method !== "undefined") { form.method = method; }
    if(typeof action !== "undefined") { form.action = action; }
    return form;
};
exports.createForm = createForm;

var createFieldset = function (id, label) {
    var fieldset = document.createElement("fieldset");
    if(typeof id !== "undefined") { fieldset.id = id; }
    if (typeof label !== "undefined") {
        fieldset.appendChild(createLegend(id + "-legend", label));
    }
    return fieldset;
};
exports.createFieldset = createFieldset;

var createOption = function (val, text, selected) {
    var option = document.createElement("option");
    option.appendChild(document.createTextNode(text));
    option.value = val;
    if(typeof selected !== "undefined") { option.selected=selected; }
    return option;
};
exports.createOption = createOption;

var createOptgroup = function (label, options) {
    var optgroup = document.createElement("optgroup");
    optgroup.label = label;
    optgroup.appendChild(options);
    return optgroup;
};
exports.createOptgroup = createOptgroup;

var getOptionsRecursive = function (vals, defaultValue) {
    var frag = document.createDocumentFragment();
    $.each(vals, function(idx, val) {
        if($.isArray(val)) {
            frag.appendChild(createOptgroup(idx, getOptionsRecursive(val[0], defaultValue)));
        } else
            if(typeof defaultValue !== "undefined" && idx === defaultValue) {
                frag.appendChild(createOption(idx, val.name, "selected"));
            } else {
                frag.appendChild(createOption(idx, val.name));
            }
        return true;
    });
    return frag;
};
exports.getOptionsRecursive = getOptionsRecursive;

var createSelect = function (id, name, vals, defaultValue) {
    var select = document.createElement("select");
    select.name = name;
    if(typeof id !== "undefined") { select.id = id; }
    var ret = getOptionsRecursive(vals, defaultValue);
    select.appendChild(ret);
    return select;
};
exports.createSelect = createSelect;

var createLink = function (id, title, href, text, name) {
    var link = document.createElement("a");
    if(typeof id !== "undefined") { link.id = id; }
    if(typeof title !== "undefined") { link.title = title; }
    if(typeof href !== "undefined") { link.href = href; }
    if(typeof name !== "undefined") { link.name = name; }
    link.appendChild(document.createTextNode(text));
    return link;
};
exports.createLink = createLink;

var createHelpLink = function (linkId, linkTitle) {
    var span = document.createElement("span");
    span.className = "helplink";
    span.appendChild(createLink(linkId, linkTitle, "#", "[?]"));
    return span;
};
exports.createHelpLink = createHelpLink;

var createHelpItem = function (name, description) {
    var frag = document.createDocumentFragment();
    var dt = document.createElement("dt");
    var dd = document.createElement("dd");
    dt.appendChild(document.createTextNode(name));
    dd.appendChild(document.createTextNode(description));
    frag.appendChild(dt);
    frag.appendChild(dd);
    return frag;
};
exports.createHelpItem = createHelpItem;

var createHelpGroup = function (name, subtree, depth) {
    var frag = document.createDocumentFragment();
    var header = document.createElement("h" + depth);
    header.appendChild(document.createTextNode(name));
    frag.appendChild(header);
    frag.appendChild(subtree);
    return frag;
};
exports.createHelpGroup = createHelpGroup;

var getHelpRecursive = function (vals, depth) {
    var frag = document.createDocumentFragment();
    $.each(vals, function(idx, val) {
        if($.isArray(val)) {
            frag.appendChild(createHelpGroup(idx, getHelpRecursive(val[0]), depth + 1));
        }
        else {
            if(typeof val.help !== "undefined") {
                frag.appendChild(createHelpItem(val.name, val.help));
            }
        }
        return true;
    });    
    return frag;
};
exports.getHelpRecursive = getHelpRecursive;

var createDialog = function(div, title, width, height) {
    $(div).dialog({
        appendTo: "#main",
        autoOpen: false,
        title: title,
        width: width,
        height: height,
        modal: true,
        buttons: {
            "Close": function() {
                $(this).dialog("close");
            }
        }
    });
};
exports.createDialog = createDialog;

var createHelp = function (helpDivId, helpData, title, width, height, helpElementType, helpCallback) {
    if(typeof helpElementType === "undefined") { helpElementType = "dl"; }
    if(typeof helpCallback === "undefined") { helpCallback = getHelpRecursive; }
    var div = createDiv(helpDivId);
    var frag = document.createDocumentFragment();
    var parent_elem = div.appendChild(document.createElement(helpElementType));
    parent_elem.appendChild(helpCallback(helpData, 2));
	createDialog(div, title, width, height);

    return frag;
};
exports.createHelp = createHelp;

var getTextareaLabeled = function (id, label, value, readonly) {
    var frag = document.createDocumentFragment();
    frag.appendChild(createLabel(id + "-label", label, id));
    frag.appendChild(createTextarea(id, value, readonly));
    return frag;
};
exports.getTextareaLabeled = getTextareaLabeled;

var getSelector = function (prettyName, divId, selectName, selectId, defaultValue, data) {
    var div = createDiv(divId);
    div.appendChild(createLabel(divId + "-label", prettyName, divId));
    div.appendChild(createSelect(selectId, selectName, data, defaultValue));
    return div;
};
exports.getSelector = getSelector;

var getCheckbox = function (divId, cbId, cbName, cbValue, cbLabel) {
    var div = createDiv(divId);
    div.appendChild(createInputElement("checkbox", undefined, cbId, cbName, cbValue));
    div.appendChild(createLabel(cbId + "-label", cbLabel, cbId));
    return div;
};
exports.getCheckbox = getCheckbox;

var getSelectorWithHelp = function (prettyName, divId, selectName, selectId, defaultValue, data, helpLinkTooltip, helpWidth, helpHeight, helpElementType, helpCallback) {
    var div = getSelector(prettyName, divId, selectName, selectId, defaultValue, data);
    var helpDivId = divId + "-help";
    var helpLinkId = helpDivId + "-link";
    div.appendChild(createHelpLink(helpLinkId, helpLinkTooltip));
    div.appendChild(createHelp(helpDivId, data, prettyName, helpWidth, helpHeight, helpElementType, helpCallback));

    $("#" + helpLinkId, div).click(function() {
        $("#" + helpDivId).dialog("open");
        return false;
    });

    return div;
};
exports.getSelectorWithHelp = getSelectorWithHelp;

var mkOpt = function (name, help) {
    return { name: name, help: help };
};
exports.mkOpt = mkOpt;

var mkOptGroup = function (opts) {
    return [opts];
};
exports.mkOptGroup = mkOptGroup;