require('./globals-helpers').importGlobals([
    { module: 'condExport.js', name: 'condExport' },
    { module: '__test__/condExport.test.exporter.obj.js', spread: true },
], '..');

test('it works', function () {
    expect(foo).toBeDefined();
    expect(foo()).toBe('foo');
});