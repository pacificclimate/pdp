/*jslint browser: true, devel: true */
/*global $, jQuery */

window.pdp = (function (my, $) {
    "use strict";
    my.curry = function (fn) {
        var curryArgs = Array.prototype.slice.call(arguments, 1);
        return function () {
            var newArgs = Array.prototype.slice.call(arguments, 0), mergedArgs = curryArgs.concat(newArgs);
            return fn.apply(this, mergedArgs);
        };
    };

    my.createInputElement = function (type, cssClass, id, name, value) {
        var ie = document.createElement("input");
        ie.type = type;
        if (cssClass !== undefined) { ie.className = cssClass; }
        if (id !== undefined) { ie.id = id; }
        if (name !== undefined) { ie.name = name; }
        if (value !== undefined) {
            ie.value = value;
            ie.defaultValue = value;
        }
        return ie;
    };

    my.createTextarea = function (id, value, readonly) {
        var ta = document.createElement("textarea");
        if (id !== undefined) { ta.id = id; }
        if (value !== undefined) {
            ta.value = ta.defaultValue = value;
        }
        if (readonly !== undefined) { ta.readonly = "readonly"; }
        return ta;
    };

    my.createDiv = function (id, className) {
        var div = document.createElement("div");
        if (id !== undefined) { div.id = id; }
        if (className !== undefined) { div.className = className; }
        return div;
    };

    my.createLabel = function (id, text, forId) {
        var label = document.createElement("label");
        if (id !== undefined) { label.id = id; }
        label.appendChild(document.createTextNode(text));
        label.htmlFor = forId;
        return label;
    };

    my.createLegend = function (id, text) {
        var legend = document.createElement("legend");
        if (id !== undefined) { legend.id = id; }
        legend.appendChild(document.createTextNode(text));
        return legend;
    };

    my.createForm = function (id, name, method, action) {
        var form = document.createElement("form");
        if (id !== undefined) { form.id = id; }
        if (name !== undefined) { form.name = name; }
        if (method !== undefined) { form.method = method; }
        if (action !== undefined) { form.action = action; }
        return form;
    };

    my.createFieldset = function (id, label) {
        var fieldset = document.createElement("fieldset");
        if (id !== undefined) { fieldset.id = id; }
        if (label !== undefined) {
            fieldset.appendChild(my.createLegend(id + "-legend", label));
        }
        return fieldset;
    };

    my.createOption = function (val, text, selected) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode(text));
        option.value = val;
        if (selected !== undefined) { option.selected = selected; }
        return option;
    };

    my.createOptgroup = function (label, options) {
        var optgroup = document.createElement("optgroup");
        optgroup.label = label;
        optgroup.appendChild(options);
        return optgroup;
    };

    my.getOptionsRecursive = function (vals, defaultValue) {
        var frag = document.createDocumentFragment();
        $.each(vals, function (idx, val) {
            if ($.isArray(val)) {
                frag.appendChild(my.createOptgroup(idx, my.getOptionsRecursive(val[0], defaultValue)));
            } else if (defaultValue !== undefined && idx === defaultValue) {
                frag.appendChild(my.createOption(idx, val.name, "selected"));
            } else {
                frag.appendChild(my.createOption(idx, val.name));
            }
            return true;
        });
        return frag;
    };

    my.createSelect = function (id, name, vals, defaultValue) {
        var select, ret;
        select = document.createElement("select");
        select.name = name;
        if (id !== undefined) { select.id = id; }
        ret = my.getOptionsRecursive(vals, defaultValue);
        select.appendChild(ret);
        return select;
    };

    my.createLink = function (id, title, href, text, name) {
        var link = document.createElement("a");
        if (id !== undefined) { link.id = id; }
        if (title !== undefined) { link.title = title; }
        if (href !== undefined) { link.href = href; }
        if (name !== undefined) { link.name = name; }
        link.appendChild(document.createTextNode(text));
        return link;
    };

    my.createHelpLink = function (linkId, linkTitle) {
        var span = document.createElement("span");
        span.className = "helplink";
        span.appendChild(my.createLink(linkId, linkTitle, "#", "[?]"));
        return span;
    };

    my.createHelpItem = function (name, description) {
        var frag = document.createDocumentFragment(),
            dt = document.createElement("dt"),
            dd = document.createElement("dd");
        dt.appendChild(document.createTextNode(name));
        dd.appendChild(document.createTextNode(description));
        frag.appendChild(dt);
        frag.appendChild(dd);
        return frag;
    };

    my.createHelpGroup = function (name, subtree, depth) {
        var frag = document.createDocumentFragment(),
            header = document.createElement("h" + depth);
        header.appendChild(document.createTextNode(name));
        frag.appendChild(header);
        frag.appendChild(subtree);
        return frag;
    };

    my.getHelpRecursive = function (vals, depth) {
        var frag = document.createDocumentFragment();
        $.each(vals, function (idx, val) {
            if ($.isArray(val)) {
                frag.appendChild(my.createHelpGroup(idx, my.getHelpRecursive(val[0]), depth + 1));
            } else if (val.help !== undefined) {
                frag.appendChild(my.createHelpItem(val.name, val.help));
            }
            return true;
        });

        return frag;
    };

    my.createDialog = function (div, title, width, height) {
        $(div).dialog({
            appendTo: "#main",
            autoOpen: false,
            title: title,
            width: width,
            height: height,
            modal: true,
            buttons: {
                "Close": function () {
                    $(this).dialog("close");
                }
            }
        });
    };

    my.createHelp = function (helpDivId, helpData, title, width, height, helpElementType, helpCallback) {
        var div, frag, parent_elem;
        if (helpElementType === undefined) { helpElementType = "dl"; }
        if (helpCallback === undefined) { helpCallback = my.getHelpRecursive; }
        div = my.createDiv(helpDivId);
        frag = document.createDocumentFragment();
        parent_elem = div.appendChild(document.createElement(helpElementType));
        parent_elem.appendChild(helpCallback(helpData, 2));
        my.createDialog(div, title, width, height);

        return frag;
    };

    my.getTextareaLabeled = function (id, label, value, readonly) {
        var frag;
        frag = document.createDocumentFragment();
        frag.appendChild(my.createLabel(id + "-label", label, id));
        frag.appendChild(my.createTextarea(id, value, readonly));
        return frag;
    };

    my.getSelector = function (prettyName, divId, selectName, selectId, defaultValue, data) {
        var div = my.createDiv(divId);
        div.appendChild(my.createLabel(divId + "-label", prettyName, divId));
        div.appendChild(my.createSelect(selectId, selectName, data, defaultValue));
        return div;
    };

    my.getCheckbox = function (divId, cbId, cbName, cbValue, cbLabel) {
        var div = my.createDiv(divId);
        div.appendChild(my.createInputElement("checkbox", undefined, cbId, cbName, cbValue));
        div.appendChild(my.createLabel(cbId + "-label", cbLabel, cbId));
        return div;
    };

    my.getSelectorWithHelp = function (prettyName, divId, selectName, selectId, defaultValue, data, helpLinkTooltip, helpWidth, helpHeight, helpElementType, helpCallback) {
        var div = my.getSelector(prettyName, divId, selectName, selectId, defaultValue, data),
            helpDivId = divId + "-help",
            helpLinkId = helpDivId + "-link";
        div.appendChild(my.createHelpLink(helpLinkId, helpLinkTooltip));
        div.appendChild(my.createHelp(helpDivId, data, prettyName, helpWidth, helpHeight, helpElementType, helpCallback));

        $("#" + helpLinkId, div).click(function () {
            $("#" + helpDivId).dialog("open");
            return false;
        });

        return div;
    };

    my.mkOpt = function (name, help) {
        return { name: name, help: help };
    };

    my.mkOptGroup = function (opts) {
        return [opts];
    };

    my.toTitleCase = function(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    return my;

}(window.pdp || {}, jQuery));
