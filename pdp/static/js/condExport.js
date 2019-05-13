// Helper for exporting modules in both "bare" JS browser environment and
// in Node environment.
//
// Environment recognition adapted from jQuery.
//
// This helper is best used with the revealing module pattern, as shown below.
//
// Use case (1): In bare browser environment, export to single named global,
// `myModule`.
//
//     (function() {
//         // This module exports only `b` and `c`.
//         // `a` is a private, internal function that is not exported.
//
//         function a() {
//             // ...
//         }
//
//         function b() {
//             // ...
//         }
//
//         var c = 42;
//
//         condExport(module, {
//             b: b,
//             c: c
//         }, 'myModule');
//     })();
//
// Use case (2): In bare browser environment, export all objects (`b`, `c`)
// to global object. Note absence of argument `name`, which is the signal to
// spread the exports onto the global object.
//
//     (function() {
//         // ...
//
//         condExport(module, {
//             b: b,
//             c: c
//         });
//     })();
//
// Alternatively, without the revealing module pattern:
//
//     function a() {
//         // ...
//     }
//
//     function b() {
//         // ...
//     }
//
//     var c = 42;
//
//     condExport(module, {
//         b: b,
//         c: c
//     }, 'myModule');


// To prevent problems in the browser environment, we must declare `module`.
// That declaration is as logically placed here as anywhere.
var module;

(function(window, module) {
    // TODO: Should `window` be a param of `condExport`?
    function condExport(module, exports, name) {
        //  Export `exports` to either `window` or `module.exports`, depending
        //  on whether we are in bare browser environment or in Nodejs
        //  environment, respectively.
        //
        //  Parameters:
        //
        // `module`: Any
        //     Passed in global variable `module`. This enables this
        //     function to discern what environment we are in.
        //
        // `exports`: Object
        //      Objects to be exported.
        //
        // `name`: String
        //     In bare browser environment, global (window) name to assign
        //     to unspread exports object.
        //     If name is falsy, add all named objects in `exports` to
        //     global scope instead.

        if (typeof module === "object" && module && typeof module.exports === "object") {
            // Expose `exports` as module.exports in loaders that implement the Node
            // module pattern (including browserify). Do not create the global, since
            // the user will be storing it themselves locally, and globals are frowned
            // upon in the Node module world.
            module.exports = exports;
        } else {
            // Otherwise expose exports to the global object with provided name
            // or spread exports object onto global object.
            if (name) {
                window[name] = exports;
            } else {
                Object.keys(exports).forEach(function (name) {
                    window[name] = exports[name];
                });
            }
        }
    }

    // Now if this ain't meta, nothin' is.
    condExport(module, condExport, 'condExport');
})(window, module);