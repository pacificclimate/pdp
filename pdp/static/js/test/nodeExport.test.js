require('./globals-helpers').importGlobals([
    { module: 'nodeExport.js', name: 'nodeExport' },
    { module: 'test/nodeExport.test.exporter.obj.js', spread: true },
], '..');

test('it works', function () {
    expect(foo).toBeDefined();
    expect(foo()).toBe('foo');
});