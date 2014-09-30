// pdp ie hacks

/*jshint browser: true*/
/*jshint bitwise: false*/
/* global ActiveXObject*/

"use strict";

window.shittyIE = (!Object.keys && !Array.prototype.IndexOf);

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if (from < 0) {
      from += len;
    }

    for (; from < len; from += 1)
    {
      if (from in this && this[from] === elt) {
        return from;
      }
    }
    return -1;
  };
}

var handle_xml = function(response, status, jqXHR) {
    if (status === "parsererror") { // We must be in IE8 with broken XML parsing
	var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	xmlDoc.async = false;
	xmlDoc.validateOnParse = false;
	xmlDoc.resolveExternals = false;
	xmlDoc.loadXML(response.responseText);

	if (xmlDoc.parseError.errorCode !== 0) {
	    var myErr = xmlDoc.parseError;
	    console.log("You have error " + myErr.reason);
	}

	jqXHR.responseXML = xmlDoc;
    } else {
	alert("There was an unhandleable problem fetching some metadata for the current layer. Unfortunately this prevents some of the controls from functioning properly. Please try a page reload and if the problem persists, please file a bug report.");
    }
};
exports.handle_xml = handle_xml;
