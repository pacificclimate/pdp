// A test user of es6export

(function () {
    function foo() {
        return 'foo';
    }

    condExport(module, {
        foo: foo
    }, 'nodeExportTestExporterObj');
})();