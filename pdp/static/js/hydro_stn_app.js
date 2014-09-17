
$(document).ready(function() {
    map = init_hydro_stn_map();    

    var controls = getHydroStnControls();
    document.getElementById("pdp-controls").appendChild(controls);
    document.getElementById("pdp-controls").appendChild(getDownloadOptions());
    
    var dataArray;

    var selection_callback = function(event, ui) {

        map.selectFeatureByFid(ui.item.value);
        $('#searchBox').val('');
        return false;
    };
    $(controls.sBox).autocomplete({
        select: selection_callback,
        delay: 100,
        minLength: 2
    });

    // Set up station layer events
    var stnLayer = map.getStnLayer();
    stnLayer.events.on({
        'featureselected': function(feature) {
            addToSidebar(feature.feature.fid, dataArray);
        },
        'featureunselected': function(feature) {
            removeFromSidebar(feature.feature.fid);
        }
    });

    $.ajax(pdp.app_root + "/csv/routed_flow_metadatav4.csv").done(function(data) {
        dataArray = $.csv.toObjects(data);
        for(i = 0; i < dataArray.length; ++i) {
            dataArray[i].idx = i;
        }

        searchData = $.map(dataArray, function(x) {
            return { label: x.StationName, value: x.idx };
        }).concat($.map(dataArray, function(x) {
            return { label: x.SiteID, value: x.idx };
        }));

        // Adds data to the search box.
        $('#searchBox').autocomplete(
            "option",
            "source",
            searchData
        );

        var inProj = new OpenLayers.Projection("EPSG:4326");
        var outProj = map.getProjectionObject();

        $(dataArray).each(function(idx, row) {
            var pt = new OpenLayers.Geometry.Point(
                parseFloat(row.Longitude),
                parseFloat(row.Latitude)).transform(inProj, outProj);
            var feature = new OpenLayers.Feature.Vector(pt);
            feature.fid = idx;
            stnLayer.addFeatures(feature);
        });
    });

    $("#download").click(function(){
        extension = $('select[name="data-format"]').val();
        fids = map.getSelectedFids()
        download(fids, extension, 'data')
    });
    $("#permalink").click(function(){
        extension = $('select[name="data-format"]').val();
        download(fids, extension, 'link')
    });
});
