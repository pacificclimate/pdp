// This module defines helpers for managing globals in testing.
// It is not a part of the PDP frontend proper, but part of the testbed.

var fs = require('fs');

var globalEval = eval;


function importGlobals(specs, rootdir) {
    // Import a list of modules, and add them to the global scope.
    //
    // Import actions are specified by arg `specs`, which is an array of
    // objects with the following properties:
    //
    //      Module properties: For importing JS code that follows one of the
    //          following patterns:
    //
    //          1. The Node.js module standard (https://nodejs.org/api/modules.html),
    //              which mainly means that it assigns a value to
    //              `module.exports`.
    //
    //          2. The assign-to-global pattern, which means that the file
    //             explicitly assigns items to the global scope: Example:
    //              `windows.myValue = 42;`
    //
    //      `module`: String  *required
    //          Path to module (relative to `rootdir`).
    //      `name`: String | Array[String]  *optional
    //          Name(s) to which to assign module.exports in global scope
    //          If absent, the module is not assigned a name. This is needed
    //          if the module does not use the assign-to-global pattern for
    //          the entire module object. Example: jQuery.
    //      `spread`: Boolean  *optional
    //          If truthy, add all named objects in module.exports to
    //          global scope. This is needed for modules that don't
    //          use the assign-to-global pattern for each exported item
    //          in the module. Example: pdp_download.js and most other
    //          PCIC-written (i.e., not external library) code under
    //          pdp/static/js.
    //
    //      Include properties: For importing JS code that does not follow
    //          one of the patterns mentioned above. This imported code is
    //          executed directly in the global scope. This is not very safe.
    //
    //          Caveat: This fails with code that declares "use strict" at the
    //          global level.
    //
    //      `include`: String  *optional
    //          If present, the file is "included", which means that it is
    //          read and executed in the global scope. This is for files
    //          like OpenLayers, that do not export anything and therefore
    //          cannot be treated as modules.

    specs.forEach(function (spec) {
        if (spec.eval) {
            globalEval(spec.eval);
        }
        if (spec.include) {
            // It's not a module and has to be included using arcane techniques.
            // We want it to have access to the global context, so we have to
            // use eval. And to evaluate it in that global context, we have
            // to capture eval there as `globalEval`.
            // See https://www.scriptol.com/javascript/include.php
            globalEval(
                fs.readFileSync(__dirname + '/' + rootdir + '/' + spec.include)+''
            );
        }
        if (spec.module) {
            // It's a nice, friendly, normal module.
            var imports = require(rootdir + '/' + spec.module);
            if (spec.name) {
                var names =
                    Array.isArray(spec.name) ? spec.name : [spec.name];
                names.forEach(function (name) {
                    window[name] = imports;
                })
            }
            if (spec.spread) {
                Object.keys(imports).forEach(function (name) {
                    window[name] = imports[name];
                });
            }
        }
    });
}


module.exports = {
    importGlobals: importGlobals
};
