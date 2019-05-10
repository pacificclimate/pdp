(function($) {
    "use strict";

    function getCatalog() {
        return $.ajax("../catalog/catalog.json", {dataType: "json"});
    }


    function getMetadata(layer_id) {
        var layer_params = {
            "id": layer_id.split('/')[0],
            "var": layer_id.split('/')[1]
        };

        return $.ajax({
            url: "../metadata.json?request=GetMinMaxWithUnits",
            data: layer_params
        });
    }


    function getRasterAccordionMenuData(ensembleName) {
        var url = '../menu.json?ensemble_name=' + ensembleName;
        return $.ajax(url, {dataType: "json"});
    }


    function getNCWMSLayerCapabilities(ncwms_layer) {

        // FIXME: this .ajax logic doesn't really work in all cases
        // What we really want is the fail() handler to _resolve_ the status,
        // and then have another fail() fallthrough handler .That is impossible, however.
        // see: http://domenic.me/2012/10/14/youre-missing-the-point-of-promises/

        var deferred = $.Deferred();

        var params = {
            REQUEST: "GetCapabilities",
            SERVICE: "WMS",
            VERSION: "1.1.1",
            DATASET: ncwms_layer.params.LAYERS.split("/")[0]
        };

        $.ajax({
            url: ncwms_layer.url,
            data: params,
        })
        .fail(handle_ie8_xml)
        .always(function (response, status, jqXHR) {
            deferred.resolve($(jqXHR.responseXML));
        });

        return deferred.promise();
    }


    function getNcwmsLayerDDS(layerUrl) {
        return $.ajax({
            url: (layerUrl + ".dds?time")
        })
    }


    function getNcwmsLayerDAS(layerUrl) {
        return $.ajax({
            url: (layerUrl + ".das")
        })
    }


    function getStationCount(data, success) {
        return $.ajax({
            url: '../count_stations',
            data: data,
            type: 'GET',
            dataType: 'json',
            success: success
        });
    }


    function getRecordLength(data, success) {
        return $.ajax({
            url: '../record_length',
            data: data,
            type: 'GET',
            dataType: 'json',
            success: success
        });
    }


    condExport(module, {
        getCatalog: getCatalog,
        getMetadata: getMetadata,
        getRasterAccordionMenuData: getRasterAccordionMenuData,
        getNCWMSLayerCapabilities: getNCWMSLayerCapabilities,
        getNcwmsLayerDDS: getNcwmsLayerDDS,
        getNcwmsLayerDAS: getNcwmsLayerDAS,
    }, 'dataServices');
})(jQuery);