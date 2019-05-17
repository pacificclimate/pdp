// A test user of condExport

(function () {
    function foo() {
        return 'foo';
    }

    condExport(module, {
        foo: foo
    }, 'nodeExportTestExporterObj');
})();
