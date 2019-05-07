// Simple utility to provide classes with inheritance.
//
// Based on https://medium.com/@_jmoller/javascript-clases-and-inheritance-1f8de29c845c
//
// Pattern of usage is shown in `test/classes.test.js`, classes `A` and `B`.
//
// There is a bit of boilerplate each class definition must do (see pattern of
// usage, above), but (a) it's not a lot, and (b) it's waaay simpler than the
// purely manual method, and (c) it keeps this utility simple (some stuff
// could obviously be optimized, but you would lose some niceties in naming
// of functions. This policy is subject to review!

(function() {
    function classCallCheck(instance, Constructor) {
        // Throws an error if `Constructor` is not invoked with `new`.
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function inherit(Child, Parent) {
        Child.prototype = new Parent();
    }


    function addProperties(target, props) {
        var propNames = Object.keys(props);
        for (var i = 0; i < propNames.length; i++) {
            var propName = propNames[i];
            target[propName] = props[propName];
        }
    }


    function addClassProperties(Class, protoProps, staticProps) {
        // Add prototype and static properties to class (constructor) `Class`.
        if (protoProps) addProperties(Class.prototype, protoProps);
        if (staticProps) addProperties(Class, staticProps);
    }


    function unimplementedAbstractMethod(name) {
        return function() {
            throw new Error('Unimplemented abstract method: ' + name);
        }
    }


    function validateClass(obj, Cls, objName) {
        if (!(obj instanceof Cls)) {
            throw new Error('Expected ' + objName + ' to be an instance of ' + Cls.name);
        }
    }


    condExport(module, {
        classCallCheck: classCallCheck,
        inherit: inherit,
        addProperties: addProperties,
        addClassProperties: addClassProperties,
        unimplementedAbstractMethod: unimplementedAbstractMethod,
        validateClass: validateClass
    }, 'classes')
})();
