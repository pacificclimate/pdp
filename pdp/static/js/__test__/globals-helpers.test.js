"use strict";

require('./globals-helpers').importGlobals([
    { module: 'module1.js', name: 'module1' },
    { module: 'module2.js', spread: true },
    { module: 'module1-extension.js' },

    { include: 'include1.js' },
    { include: 'include2.js' },

    { eval: 'var foo = "bar"' }
], './globals-helpers-testers');


describe('modules', function () {
    test('standard module, name, no spread', function () {
        expect(module1).toBeDefined();
        expect(module1.module1a).toBeDefined();
        expect(function() { return module1a; }).toThrow(ReferenceError);
    });

    test('standard module, spread, no name', function() {
        expect(module2a).toBeDefined();
        expect(module2b).toBeDefined();
    });

    test('extension code, execute only (no name, no spread)', function () {
        expect(module1.extension).toBeDefined();
    });
});


describe('includes', function () {
    test('non-strict code', function () {
        expect(include1).toBeDefined();
    });

    test('strict code', function () {
        expect(function () { return include2; }).toThrow(ReferenceError);
    });
});


test('eval works', function () {
    expect(foo).toBe('bar');
});
