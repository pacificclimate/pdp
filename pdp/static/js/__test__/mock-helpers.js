// Helper functions for creating mocks
// For tests only, so is a pure Node module

function makeMockGet(name, defaultData, autoResolve) {
    // Returns a get function which acts like `$.ajax()`, i.e. returns a
    // jQuery deferred.
    //
    // The deferred is attached as a property `deferred` of the function,
    // so that the user can control when and how it is resolved or rejected.
    // This permits before-and-after tests of (what would be) asynchronous
    // data fetches.
    //
    // Also attached to the function is a convenience function
    // `resolveWithDefault`, which resolves the deferred with the
    // `defaultData` argument to this maker function.
    //
    // The parameter `autoResolve`, if truthy, causes the deferred
    // to resolve immediately with the provided default data.
    // This is for cases where there is no wish to perform before-and-after
    // tests.
    //
    // Also attached to the function is a function `reset`, which sets the
    // Deferred to a new deferred so that it can be invoked repeatedly with
    // fresh data each time.

    var deferred = $.Deferred();

    function get() {
        return deferred;
    }
    get.name = name;

    get.deferred = deferred;

    get.resolveWithDefault = function () {
        deferred.resolve(defaultData);
    };

    if (autoResolve) {
        get.resolveWithDefault();
    }

    get.reset = function () {
        deferred = $.Deferred();
    };

    return get;
}


function unexpectedRequest(config) {
    // Parallel to `makeMockGet`, but returns a `get` function that only
    // signals a problem if it is called.
    //
    // The attached functions `resolveWithDefault` and `reset` do nothing,
    // but permit the returned `get` to be used identically so that
    // test setup and teardown does not have to have special cases for these
    // mocks.
    function get() {
        if (config.log) {
            console.log('Unexpected request ' + config.name, arguments);
        }
        if (config.throw) {
            throw new Error('Unexpected request '+ config.name);
        }
    }

    get.resolveWithDefault = function() {};
    get.reset = function() {};

    return get;
}



function mock$ajax(config) {
    // Replace jQuery.ajax() with a mock call that can log and/or
    // throw an error if such a request is made. This makes it easy to find
    // places in code where unmocked requests are being issued.
    var $ajax = $.ajax;
    $.ajax = function() {
        if (config.log) {
            console.log('$.ajax(): request', arguments);
        }
        if (config.throw) {
            throw new Error('Unexpected $.ajax()');
        }
        var response = $ajax.apply(arguments);
        response.done(function () {
            if (config.log) {
                console.log('$.ajax(): response', arguments, response);
            }
        });
        return response;
    };
}


function mockOLXMLHttpRequest(config) {
    // Replace OpenLayers.XMLHttpRequest() with a mock call that can log and/or
    // throw an error if such a request is made. This makes it easy to find
    // places in code where unmocked requests are being issued.
    // We don't log responses in this one, because lazy ...
    var OLXHR = OpenLayers.XMLHttpRequest;
    OpenLayers.XMLHttpRequest = function() {
        if (config.log) {
            console.log('OpenLayers.XMLHttpRequest(): request', arguments);
        }
        if (config.throw) {
            throw new Error('Unexpected OpenLayers.XMLHttpRequest()')
        }
        var response = OLXHR.apply(arguments);
        return response;
    };
}


module.exports = {
    makeMockGet: makeMockGet,
    unexpectedRequest: unexpectedRequest,
    mock$ajax: mock$ajax,
    mockOLXMLHttpRequest: mockOLXMLHttpRequest
};