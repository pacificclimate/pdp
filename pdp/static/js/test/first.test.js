describe('test the test framework with some tests', function() {
    test('true is truthy', function() {
        expect(true).toBe(true);
    });
    test('OMFG', function() {
        expect(false).toBe(true);
    });
});
