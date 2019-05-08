var each = require('jest-each').default;
var _ = require('lodash');

require('./globals-helpers').importGlobals([
    { module: 'js/lodash.core.js', name: ['_', 'lodash'] },
    { module: 'js/condExport.js', name: 'condExport' },
    { module: 'js/classes.js', name: 'classes' },
    { module: 'js/calendars.js', name: 'calendars' },
    { module: 'js/pdp_raster_map.js', spread: true },
], '../..');

var CalendarDatetime = calendars.CalendarDatetime;
var CfTimeSystem = calendars.CfTimeSystem;
var CfDatetime = calendars.CfDatetime;


function mapToObj(list, fn) {
    // Map a list (array) of keys to an object containing `{ [key]: fn(key) }`
    // for each key.
    return _.fromPairs(
        _.map(list, function(name) {
            return [name, fn(name)];
        })
    );
}

var calendar = {
    'greg': calendars.gregorian,
    'f365': calendars['365_day'],
    'f360': calendars['360_day'],
};
var calNames = Object.keys(calendar);

var calDate = mapToObj(calNames, function(name) {
    return function(year, month, day) {
        return new CalendarDatetime(calendar[name], year, month, day);
    };
});

var cftsStartDate = mapToObj(calNames, function (name) {
    return calDate[name](1950, 1, 1);
});

var cfTimeSystem = mapToObj(calNames, function (name) {
    return new CfTimeSystem('days', cftsStartDate[name], 1e6);
});

var fallbackDate = mapToObj(calNames, function (name) {
    return cfTimeSystem[name].lastCfDatetime();
});

var cfDatetime = mapToObj(calNames, function (name) {
    return function(year, month, day) {
        return new CfDatetime.fromDatetime(cfTimeSystem[name], year, month, day)
    }
});



describe('transferDate', function() {
    describe('fully transferrable dates', function () {
        each([
            [1950, 1, 1],
            [1950, 11, 11],
            [1952, 2, 28],  // a leap year, but a valid date in all systems
        ]).describe('Date: %d-%d-%d', function (year, month, day) {
            each(calNames).describe('from %s', function (fromName) {
                var date = cfDatetime[fromName](year, month, day);
                each(calNames).it('to %s: transfers', function (toName) {
                    expect(transferDate(date, cfTimeSystem[toName], fallbackDate[toName]))
                    .toEqual(cfDatetime[toName](year, month, day));
                })
            });
        });
    });


    describe('tricky dates', function () {
        each([
            ['greg', 1950, 1, 31, { f365: true, f360: false }],
            ['greg', 1952, 2, 29, { f365: false, f360: true }],

            ['f365', 1950, 1, 31, { greg: true, f360: false }],

            ['f360', 1950, 2, 29, { greg: false, f365: false }],
            ['f360', 1950, 2, 30, { greg: false, f365: false }],
            ['f360', 1952, 2, 29, { greg: true, f365: false }],
            ['f360', 1952, 2, 30, { greg: false, f365: false }],
        ]).describe(
            'from %s %d-%d-%d',
            function (fromName, year, month, day, outcome) {
                var date = cfDatetime[fromName](year, month, day);
                each(Object.keys(outcome)).it('to %s: correct outcome', function (toName) {
                    var expectedDate =
                        outcome[toName] ?
                            cfDatetime[toName](year, month, day) :
                            fallbackDate[toName];
                    expect(transferDate(date, cfTimeSystem[toName], fallbackDate[toName]))
                        .toEqual(expectedDate);
                });
            }
        );
    });
});


