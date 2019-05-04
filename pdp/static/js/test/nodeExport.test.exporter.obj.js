// A test user of es6export

(function () {
    function foo() {
        return 'foo';
    }

    nodeExport(module, {
        foo: foo
    }, 'nodeExportTestExporterObj');
})();