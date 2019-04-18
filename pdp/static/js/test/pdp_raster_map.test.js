var pdp_raster_map = require('../pdp_raster_map');


describe('CfTime', function() {
    var CfTime = pdp_raster_map.CfTime;
    var stdCfTime = new CfTime('days', new Date(1950, 0, 1));

    it('knows stuff', function() {
        expect(stdCfTime.units).toBe('days');
        expect(stdCfTime.sDate).toEqual(new Date(1950, 0, 1))
        expect(stdCfTime.calendar).toBe('standard');
        expect(stdCfTime.constantDaysPerYear).toBeUndefined();
    });
});


