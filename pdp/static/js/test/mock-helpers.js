function mock$AjaxResponse(data) {
    // This function returns what a $.ajax() call is expected to return,
    // filled with the specified data.
    var deferred = $.Deferred();
    deferred.resolve(data);
    return deferred;
}


module.exports = {
    mock$AjaxResponse: mock$AjaxResponse,
};