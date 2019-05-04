(function(window, module) {
    // TODO: Should `window` be a param of `es6export`?
    // TODO: Add `spread` param?
    function nodeExport(module, exports, name) {
        // Adapted from jQuery.
        // console.log('es6export ("' + name + '"): module =', module)
        if (typeof module === "object" && module && typeof module.exports === "object") {
            // Expose `exports` as module.exports in loaders that implement the Node
            // module pattern (including browserify). Do not create the global, since
            // the user will be storing it themselves locally, and globals are frowned
            // upon in the Node module world.
            // console.log('es6export ("' + name + '"): exporting to module.exports:', exports);
            module.exports = exports;
        } else {
            // Otherwise expose exports to the global object with provided name
            // console.log('es6export ("' + name + '"): exporting to window:', exports);
            window[name] = exports;
        }
        // console.log('es6export ("' + name + '"): module =', module)
    }

    // Now if this ain't meta, nothin' is.
    nodeExport(module, nodeExport, 'nodeExport');
})(window, module);