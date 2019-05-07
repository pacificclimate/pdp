var each = require('jest-each').default;

require('./globals-helpers').importGlobals([
    { module: 'js/condExport', name: 'condExport' },
    { module: 'js/calendars.js', name: 'calendars' },
], '../..');

var formatDatetimeISO8601 = calendars.formatDatetimeISO8601;
var SimpleDatetime = calendars.SimpleDatetime;
var Calendar = calendars.Calendar;
var GregorianCalendar = calendars.GregorianCalendar;
var Fixed365DayCalendar = calendars.Fixed365DayCalendar;
var Fixed360DayCalendar = calendars.Fixed360DayCalendar;
var CalendarFactory = calendars.CalendarFactory;
var CalendarDatetime = calendars.CalendarDatetime;
var CfTimeSystem = calendars.CfTimeSystem;
var CfDatetime = calendars.CfDatetime;

var epochYear = 1900;
var gregorianCalendar = new GregorianCalendar(epochYear);
var fixed365DayCalendar = new Fixed365DayCalendar(epochYear);
var fixed360DayCalendar = new Fixed360DayCalendar(epochYear);

// TODO: Add tests for untested methods. These are all mostly shortcuts and
// convenience methods.


// A true universal, upon which we all can agree.
var msPerDay = 1000 * 60 * 60 * 24;

function leapDaysSinceEpoch(calendar, year) {
    // Up and including `year`.
    // Valid only up to 2099!!!
    return Math.floor((year - calendar.epochYear) / 4);
}


describe('formatDatetimeISO8601', function () {
    each([
        [1900, 1, 2, 3, 4, 5, '1900-01-02T03:04:05'],
        [1900, 11, 12, 13, 14, 15, '1900-11-12T13:14:15'],
        [undefined, 11, 12, 13, 14, 15, ''],
        [1900, undefined, 12, 13, 14, 15, '1900'],
        [1900, 11, undefined, 13, 14, 15, '1900-11'],
        [1900, 11, 12, undefined, 14, 15, '1900-11-12'],
        [1900, 11, 12, 13, undefined, 15, '1900-11-12T13'],
        [1900, 11, 12, 13, 14, undefined, '1900-11-12T13:14'],
    ]).it('%#',
        function (year, month, day, hour, minute, second, expected) {
            expect(formatDatetimeISO8601(
                year, month, day, hour, minute, second
            )).toBe(expected);
        });
});


describe('all classes', function () {
    each([
        SimpleDatetime,
        Calendar,
        GregorianCalendar,
        Fixed365DayCalendar,
        Fixed360DayCalendar,
        CalendarDatetime,
        CfTimeSystem,
        CfDatetime
    ]).describe('%s', function (Class) {
        it('cannot be called as a function', function () {
            expect(function () {
                Class();
            }).toThrow();
        });
    });
});


describe('SimpleDatetime', function () {
    it('holds the data', function () {
        var simpleDatetime = new SimpleDatetime(0, 1, 2, 3, 4, 5)
        expect(simpleDatetime.year).toBe(0);
        expect(simpleDatetime.month).toBe(1);
        expect(simpleDatetime.day).toBe(2);
        expect(simpleDatetime.hour).toBe(3);
        expect(simpleDatetime.minute).toBe(4);
        expect(simpleDatetime.second).toBe(5);
    });

    it('provides defaults', function () {
        var simpleDatetime = new SimpleDatetime(999);
        ['month', 'day'].forEach(function (prop) {
            expect(simpleDatetime[prop]).toBe(1);
        });
        ['hour', 'minute', 'second'].forEach(function (prop) {
            expect(simpleDatetime[prop]).toBe(0);
        });
    });


    describe('fromIso8601', function () {
        each([
            ['1900-01-02T06:07:08', 1900, 1, 2, 6, 7, 8],
            ['1900-1-2T6:7:8', 1900, 1, 2, 6, 7, 8],
            ['1900-01-02', 1900, 1, 2, 0, 0, 0],
            ['1900-01', 1900, 1, 0, 0, 0, 0],
            ['1900', 1900, 1, 0, 0, 0, 0],
        ]).it('parses the valid string %s',
            function (string, year, month, day, hour, minute, second) {
            var expected = new SimpleDatetime(year, month, day, hour, minute, second);
            expect(SimpleDatetime.fromIso8601(string)).toEqual(expected);
        });

        each([
            'x',
            'xxxx',
            '190',
            '19000',
            '1900-x',
            '1900-01-xx',
            '1900-01-02Txx',
        ]).it('returns null for the invalid string %s',
            function (string) {
            expect(SimpleDatetime.fromIso8601(string)).toBeNull();
        });
    });
});


describe('Calendar', function () {
    var calendar = new Calendar();

    describe('toRawDatetimeFormat', function () {
        each([
            [1900, 1, 2, 3, 4, 5, '1900-1-2T3-4-5'],
            [undefined, 1, 2, 3, 4, 5, 'undefined-1-2T3-4-5'],
        ]).it('%#',
            function (year, month, day, hour, minute, second, expected) {
                expect(Calendar.toRawDatetimeFormat(
                    year, month, day, hour, minute, second
                )).toBe(expected);
            });
    });

    describe('isValidTime', function () {
        each([
            // one undefined
            [undefined, 1, 2, false],
            [1, undefined, 2, false],
            [1, 2, undefined, true],

            // two undefined
            [undefined, undefined, 1, false],
            [undefined, 1, undefined, false],
            [1, undefined, undefined, true],

            // three undefined
            [undefined, undefined, undefined, true],

            // all defined
            [0, 0, 0, true],
            [23, 59, 59, true],
            [-1, 0, 0, false],
            [0, -1, 0, false],
            [0, 0, -1, false],
            [24, 0, 0, false],
            [0, 60, 0, false],
            [0, 0, 60, false],
        ]).it('%d-%d-%d: %s',
            function (hour, minute, second, expected) {
                expect(calendar.isValidTime(hour, minute, second)).toBe(expected);
            });
    });

});


// TODO: Check datetime validation for each calendar method that needs it


describe('GregorianCalendar', function () {
    var calendar = gregorianCalendar;

    it('describes itself', function () {
        expect(calendar.type).toBe('standard');
        expect(calendar.name).toBe('Gregorian');
    });

    describe('isValidDate', function () {
        each([
            [undefined, 1, 1, false],
            [1900, undefined, 1, false],
            [1900, 1, undefined, true],

            [1900, -1, 1, false],
            [1900, 13, 1, false],

            [1900, 1, 1, true],
            [1900, 1, 31, true],
            [1900, 1, 32, false],
            [1900, 2, 1, true],
            [1900, 2, 2, true],
            [1900, 2, 28, true],
            [1900, 2, 29, false],

            [1901, 2, 28, true],
            [1901, 2, 29, false],
        ]).it('%d-%d-%d: %s',
            function (year, month, day, expected) {
                expect(calendar.isValidDate(year, month, day)).toBe(expected);
            });
    });

    describe('validateDatetime', function () {
        each([
            [undefined, 1, 1, 1, 1, 1],
            [1901, 2, 29, 1, 1, 1],
            [1901, 1, 1, 99, 1, 1],
        ]).it('',
            function (year, month, day, hour, minute, second) {
                expect(
                    function () {
                        calendar.validateDatetime(year, month, day, hour, minute, second)
                    }
                ).toThrow();
            });
    });

    describe('isLeapYear', function () {
        each([
            [1600, true],
            [1700, false],
            [1800, false],
            [1900, false],
            [2000, true],
            [1901, false],
            [1902, false],
            [1903, false],
            [1904, true],
            [2001, false],
            [2002, false],
            [2003, false],
            [2004, true],
        ]).it('correctly determines if %d is a leap year',
            function (year, expected) {
                expect(calendar.isLeapYear(year)).toBe(expected);
            });
    });

    describe('daysPerYear', function () {
        each([
            [1900, 365],
            [1901, 365],
            [2000, 366],
        ]).it('correctly returns the number of days for year %d',
            function (year, days) {
                expect(calendar.daysPerYear(year)).toBe(days);
            });
    });

    describe('daysPerMonth', function () {
        each([
            [1900, 1, 31],
            [1900, 2, 28],
            [1900, 3, 31],
            [1900, 4, 30],
            [1904, 2, 29],
            [2000, 2, 29],
        ]).it('correctly returns the number of days for month %d-%d',
            function (year, month, days) {
                expect(calendar.daysPerMonth(year, month)).toBe(days);
            });
    });

    describe('msPerUnit', function () {
        each([
            ['second', undefined, undefined, 1000],
            ['day', undefined, undefined, msPerDay],
            ['month', 1901, 1, 31 * msPerDay],
            ['month', 1901, 4, 30 * msPerDay],
            ['month', 1900, 2, 28 * msPerDay],
            ['month', 1901, 2, 28 * msPerDay],
            ['month', 1902, 2, 28 * msPerDay],
            ['month', 1903, 2, 28 * msPerDay],
            ['month', 1904, 2, 29 * msPerDay],
            ['year', 1900, undefined, 365 * msPerDay],
            ['year', 1901, undefined, 365 * msPerDay],
            ['year', 1902, undefined, 365 * msPerDay],
            ['year', 1903, undefined, 365 * msPerDay],
            ['year', 1904, undefined, 366 * msPerDay],
        ]).it('correctly computes ms per %s for %d-%d',
            function (unit, year, month, ms) {
                expect(calendar.msPerUnit(unit, year, month)).toBe(ms);
            });
    });

    var dateTimeMsSinceEpoch = [
        [new SimpleDatetime(1900),
            0],
        [new SimpleDatetime(1900, 1, 1, 0, 0, 1),
            1000],
        [new SimpleDatetime(1900, 1, 1, 0, 1, 0),
            1000 * 60],
        [new SimpleDatetime(1900, 1, 1, 1, 0, 0),
            1000 * 60 * 60],
        [new SimpleDatetime(1900, 1, 2),
            msPerDay],
        [new SimpleDatetime(1900, 1, 3),
            msPerDay * 2],
        [new SimpleDatetime(1900, 1, 31),
            msPerDay * 30],
        [new SimpleDatetime(1900, 2, 1),
            msPerDay * 31],
        [new SimpleDatetime(1900, 3, 1),
            msPerDay * (31 + 28)],
        [new SimpleDatetime(1900, 4, 1),
            msPerDay * (31 + 28 + 31)],
        [new SimpleDatetime(1900, 12, 1),
            msPerDay * (365 - 31)],
        [new SimpleDatetime(1901, 1, 1),
            msPerDay * 365],
        [new SimpleDatetime(1950, 1, 1),
            msPerDay * (50 * 365 + leapDaysSinceEpoch(calendar, 1949))],
        [new SimpleDatetime(2000, 1, 1),
            msPerDay * (100 * 365 + leapDaysSinceEpoch(calendar, 1999))]
    ];

    describe('msSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts FROM %o TO %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.msSinceEpoch(datetime)).toBe(ms);
            });
    });

    describe('simpleDatetimeFromMsSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts TO %o FROM %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.simpleDatetimeFromMsSinceEpoch(ms)).toEqual(datetime);
            });
    });
});


describe('Fixed365DayCalendar', function () {
    var calendar = fixed365DayCalendar;

    it('describes itself', function () {
        expect(calendar.type).toBe('365_day');
        expect(calendar.name).toBe('Fixed 365-day');
    });

    describe('isValidDate', function () {
        each([
            [undefined, 1, 1, false],
            [1900, undefined, 1, false],
            [1900, 1, undefined, true],

            [1900, -1, 1, false],
            [1900, 13, 1, false],

            [1900, 1, 1, true],
            [1900, 1, 31, true],
            [1900, 1, 32, false],
            [1900, 2, 1, true],
            [1900, 2, 2, true],
            [1900, 2, 28, true],
            [1900, 2, 29, false],
            [1900, 2, 30, false],

            [1901, 2, 28, true],
            [1901, 2, 29, false],
        ]).it('%d-%d-%d: %s',
            function (year, month, day, expected) {
                expect(calendar.isValidDate(year, month, day)).toBe(expected);
            });
    });

    describe('validateDatetime', function () {
        each([
            [undefined, 1, 1, 1, 1, 1],
            [1901, 2, 29, 1, 1, 1],
            [1901, 1, 1, 99, 1, 1],
        ]).it('',
            function (year, month, day, hour, minute, second) {
                expect(
                    function () {
                        calendar.validateDatetime(year, month, day, hour, minute, second)
                    }
                ).toThrow();
            });
    });

    describe('isLeapYear', function () {
        each([
            1900, 1901, 1904, 2000, 2001, 2100
        ]).it('correctly says %d is not a leap year', function (year) {
            expect(calendar.isLeapYear(year)).toBe(false);
        });
    });

    describe('daysPerYear', function () {
        each([
            1900, 1901, 1904, 2000, 2001, 2100
        ]).it('correctly says there are 365 days in every year',
            function (year) {
                expect(calendar.daysPerYear(year)).toBe(365);
            });
    });

    describe('daysPerMonth', function () {
        each([
            [1900, 1, 31],
            [1900, 2, 28],
            [1900, 3, 31],
            [1900, 4, 30],
            [2000, 2, 28],
        ]).it('correctly returns the number of days for month %d-%d',
            function (year, month, days) {
                expect(calendar.daysPerMonth(year, month)).toBe(days);
            });
    });

    describe('msPerUnit', function () {
        each([
            ['second', undefined, undefined, 1000],
            ['day', undefined, undefined, msPerDay],
            ['month', 1901, 1, 31 * msPerDay],
            ['month', 1901, 4, 30 * msPerDay],
            ['month', 1900, 2, 28 * msPerDay],
            ['month', 1901, 2, 28 * msPerDay],
            ['month', 1902, 2, 28 * msPerDay],
            ['month', 1903, 2, 28 * msPerDay],
            ['year', 1900, undefined, 365 * msPerDay],
            ['year', 1901, undefined, 365 * msPerDay],
            ['year', 1902, undefined, 365 * msPerDay],
            ['year', 1903, undefined, 365 * msPerDay],
        ]).it('correctly computes ms per %s for %d-%d',
            function (unit, year, month, ms) {
                expect(calendar.msPerUnit(unit, year, month)).toBe(ms);
            });
    });

    var dateTimeMsSinceEpoch = [
        [new SimpleDatetime(1900),
            0],
        [new SimpleDatetime(1900, 1, 1, 0, 0, 1),
            1000],
        [new SimpleDatetime(1900, 1, 1, 0, 1, 0),
            1000 * 60],
        [new SimpleDatetime(1900, 1, 1, 1, 0, 0),
            1000 * 60 * 60],
        [new SimpleDatetime(1900, 1, 2),
            msPerDay],
        [new SimpleDatetime(1900, 1, 3),
            msPerDay * 2],
        [new SimpleDatetime(1900, 1, 31),
            msPerDay * 30],
        [new SimpleDatetime(1900, 2, 1),
            msPerDay * 31],
        [new SimpleDatetime(1900, 3, 1),
            msPerDay * (31 + 28)],
        [new SimpleDatetime(1900, 4, 1),
            msPerDay * (31 + 28 + 31)],
        [new SimpleDatetime(1900, 12, 1),
            msPerDay * (365 - 31)],
        [new SimpleDatetime(1901, 1, 1),
            msPerDay * 365],
        [new SimpleDatetime(1950, 1, 1),
            msPerDay * (50 * 365)],
        [new SimpleDatetime(2000, 1, 1),
            msPerDay * (100 * 365)]
    ];

    describe('msSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts FROM %o TO %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.msSinceEpoch(datetime)).toBe(ms);
            });
    });

    describe('simpleDatetimeFromMsSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts TO %o FROM %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.simpleDatetimeFromMsSinceEpoch(ms)).toEqual(datetime);
            });
    });
});


describe('Fixed360DayCalendar', function () {
    var calendar = fixed360DayCalendar;

    it('describes itself', function () {
        expect(calendar.type).toBe('360_day');
        expect(calendar.name).toBe('Fixed 360-day');
    });

    describe('isValidDate', function () {
        each([
            [undefined, 1, 1, false],
            [1900, undefined, 1, false],
            [1900, 1, undefined, true],

            [1900, -1, 1, false],
            [1900, 13, 1, false],

            [1900, 1, 1, true],
            [1900, 1, 30, true],
            [1900, 1, 31, false],
            [1900, 2, 1, true],
            [1900, 2, 28, true],
            [1900, 2, 29, true],
            [1900, 2, 30, true],

            [1901, 2, 28, true],
            [1901, 2, 29, true],
        ]).it('%d-%d-%d: %s',
            function (year, month, day, expected) {
                expect(calendar.isValidDate(year, month, day)).toBe(expected);
            });
    });

    describe('validateDatetime', function () {
        each([
            [undefined, 1, 1, 1, 1, 1],
            [1901, 2, 33, 1, 1, 1],
            [1901, 1, 1, 99, 1, 1],
        ]).it('',
            function (year, month, day, hour, minute, second) {
                expect(
                    function () {
                        calendar.validateDatetime(year, month, day, hour, minute, second)
                    }
                ).toThrow();
            });
    });

    describe('isLeapYear', function () {
        each([
            1900, 1901, 1904, 2000, 2001, 2100
        ]).it('correctly says %d is not a leap year', function (year) {
            expect(calendar.isLeapYear(year)).toBe(false);
        });
    });

    describe('daysPerYear', function () {
        each([
            1900, 1901, 1904, 2000, 2001, 2100
        ]).it('correctly says there are 360 days in %d',
            function (year) {
                expect(calendar.daysPerYear(year)).toBe(360);
            });
    });

    describe('daysPerMonth', function () {
        each([
            [1900, 1],
            [1900, 2],
            [1900, 3],
            [1900, 4],
            [2000, 2],
        ]).it('correctly returns the number of days for month %d-%d',
            function (year, month) {
                expect(calendar.daysPerMonth(year, month)).toBe(30);
            });
    });

    describe('msPerUnit', function () {
        each([
            ['second', undefined, undefined, 1000],
            ['day', undefined, undefined, msPerDay],
            ['month', 1901, 1, 30 * msPerDay],
            ['month', 1901, 4, 30 * msPerDay],
            ['month', 1900, 2, 30 * msPerDay],
            ['month', 1901, 2, 30 * msPerDay],
            ['month', 1902, 2, 30 * msPerDay],
            ['month', 1903, 2, 30 * msPerDay],
            ['year', 1900, undefined, 360 * msPerDay],
            ['year', 1901, undefined, 360 * msPerDay],
            ['year', 1902, undefined, 360 * msPerDay],
            ['year', 1903, undefined, 360 * msPerDay],
        ]).it('correctly computes ms per %s for %d-%d',
            function (unit, year, month, ms) {
                expect(calendar.msPerUnit(unit, year, month)).toBe(ms);
            });
    });

    var dateTimeMsSinceEpoch = [
        [new SimpleDatetime(1900),
            0],
        [new SimpleDatetime(1900, 1, 1, 0, 0, 1),
            1000],
        [new SimpleDatetime(1900, 1, 1, 0, 1, 0),
            1000 * 60],
        [new SimpleDatetime(1900, 1, 1, 1, 0, 0),
            1000 * 60 * 60],
        [new SimpleDatetime(1900, 1, 2),
            msPerDay],
        [new SimpleDatetime(1900, 1, 3),
            msPerDay * 2],
        [new SimpleDatetime(1900, 1, 30),
            msPerDay * 29],
        [new SimpleDatetime(1900, 2, 1),
            msPerDay * 30],
        [new SimpleDatetime(1900, 3, 1),
            msPerDay * 30 * 2],
        [new SimpleDatetime(1900, 4, 1),
            msPerDay * 30 * 3],
        [new SimpleDatetime(1900, 12, 1),
            msPerDay * 30 * 11],
        [new SimpleDatetime(1901, 1, 1),
            msPerDay * 360],
        [new SimpleDatetime(1950, 1, 1),
            msPerDay * (50 * 360)],
        [new SimpleDatetime(2000, 1, 1),
            msPerDay * (100 * 360)]
    ];

    describe('msSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts FROM %o TO %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.msSinceEpoch(datetime)).toBe(ms);
            });
    });

    describe('simpleDatetimeFromMsSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts TO %o FROM %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.simpleDatetimeFromMsSinceEpoch(ms)).toEqual(datetime);
            });
    });
});


describe('CalendarDatetime', function () {
    describe('toMsSinceEpoch', function () {
        each([
            [gregorianCalendar, 1900, 1, 1, 0, 0, 0, 0],
            [fixed365DayCalendar, 1900, 1, 1, 0, 0, 0, 0],
            [fixed360DayCalendar, 1900, 1, 1, 0, 0, 0, 0],

            [gregorianCalendar, 1950, 1, 1, 0, 0, 0,
                msPerDay * (50 * 365 + leapDaysSinceEpoch(gregorianCalendar, 1949))],
            [fixed365DayCalendar, 1950, 1, 1, 0, 0, 0,
                msPerDay * (50 * 365)],
            [fixed360DayCalendar, 1950, 1, 1, 0, 0, 0,
                msPerDay * (50 * 360)],
        ]).it('',
            function (
                calendar, year, month, day, hour, minute, second, ms
            ) {
                var cdt = new CalendarDatetime(
                    calendar, year, month, day, hour, minute, second
                );
                expect(cdt.toMsSinceEpoch()).toBe(ms);
            });
    });
});


describe('CalendarFactory', function () {
    var calendarFactory = new CalendarFactory();

    describe('makeCalendar', function () {
        function reducedType(type) {
            if (
                type === 'standard' ||
                type === 'gregorian' ||
                type === 'proleptic_gregorian'
            ) {
                return 'standard';
            }
            return type;
        }

        each(CalendarFactory.calendarTypes)
        .it('%s', function (type) {
            var calendar = calendarFactory.createCalendar(type);
            expect(calendar.type).toBe(reducedType(type));
        });
    });
});


describe('CfTimeSystem', function () {
    // Not much to see here.
    // describe('', function () {
    //     it('', function () {
    //
    //     });
    // });
});


describe('CfDatetime', function () {
    function testToCalendarDatetime(
        index, units, startDate,
        year, month, day, hour, minute, second) {
        var cfTimeSystem = new CfTimeSystem(units, startDate);
        var cfTime = new CfDatetime(cfTimeSystem, index);
        var expected = new CalendarDatetime(
            startDate.calendar, year, month, day, hour, minute, second
        );
        expect(cfTime.toCalendarDatetime()).toEqual(expected);
    }

    function testFromDatetime(
        index, units, startDate,
        year, month, day, hour, minute, second) {
        var cfTimeSystem = new CfTimeSystem(units, startDate);
        var cfTime = CfDatetime.fromDatetime(
            cfTimeSystem, year, month, day, hour, minute, second
        );
        expect(cfTime.index).toEqual(index);
    }

    describe('for GregorianCalendar', function () {
        var startDate = new CalendarDatetime(gregorianCalendar, 1950, 1, 1);

        var testCases = [
            [0, 'seconds', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'seconds', startDate, 1950, 1, 1, 0, 0, 1],
            [10, 'seconds', startDate, 1950, 1, 1, 0, 0, 10],
            [100, 'seconds', startDate, 1950, 1, 1, 0, 1, 40],
            [1000, 'seconds', startDate, 1950, 1, 1, 0, 16, 40],
            [10000, 'seconds', startDate, 1950, 1, 1, 2, 46, 40],
            [100000, 'seconds', startDate, 1950, 1, 2, 3, 46, 40],

            [0, 'minutes', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'minutes', startDate, 1950, 1, 1, 0, 1, 0],
            [10, 'minutes', startDate, 1950, 1, 1, 0, 10, 0],
            [100, 'minutes', startDate, 1950, 1, 1, 1, 40, 0],
            [1000, 'minutes', startDate, 1950, 1, 1, 16, 40, 0],
            [10000, 'minutes', startDate, 1950, 1, 7, 22, 40, 0],

            [0, 'hours', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'hours', startDate, 1950, 1, 1, 1, 0, 0],
            [10, 'hours', startDate, 1950, 1, 1, 10, 0, 0],
            [100, 'hours', startDate, 1950, 1, 5, 4, 0, 0],
            [1000, 'hours', startDate, 1950, 2, 11, 16, 0, 0],
            [10000, 'hours', startDate, 1951, 2, 21, 16, 0, 0],

            [0, 'days', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'days', startDate, 1950, 1, 2, 0, 0, 0],
            [10, 'days', startDate, 1950, 1, 11, 0, 0, 0],
            [100, 'days', startDate, 1950, 4, 11, 0, 0, 0],
            [365, 'days', startDate, 1951, 1, 1, 0, 0, 0],
            [2 * 365, 'days', startDate, 1952, 1, 1, 0, 0, 0],
            [3 * 365, 'days', startDate, 1952, 12, 31, 0, 0, 0],

            // CF Conventions says to use units months' and 'years'
            // with caution. Not testing this yet because we haven't
            // implemented Calendar.msPerUnit to match CF Conventions/
            // UDUNITS yet.
        ];

        describe('toCalendarDatetime', function () {
            each(testCases).it('%d %s since %o', testToCalendarDatetime);
        });

        describe('fromDatetime', function () {
            each(testCases).it('works', testFromDatetime);
        });
    });


    describe('for Fixed365DayCalendar', function () {
        var startDate = new CalendarDatetime(fixed365DayCalendar, 1950, 1, 1);

        var testCases = [
            [0, 'seconds', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'seconds', startDate, 1950, 1, 1, 0, 0, 1],
            [10, 'seconds', startDate, 1950, 1, 1, 0, 0, 10],
            [100, 'seconds', startDate, 1950, 1, 1, 0, 1, 40],
            [1000, 'seconds', startDate, 1950, 1, 1, 0, 16, 40],
            [10000, 'seconds', startDate, 1950, 1, 1, 2, 46, 40],
            [100000, 'seconds', startDate, 1950, 1, 2, 3, 46, 40],

            [0, 'minutes', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'minutes', startDate, 1950, 1, 1, 0, 1, 0],
            [10, 'minutes', startDate, 1950, 1, 1, 0, 10, 0],
            [100, 'minutes', startDate, 1950, 1, 1, 1, 40, 0],
            [1000, 'minutes', startDate, 1950, 1, 1, 16, 40, 0],
            [10000, 'minutes', startDate, 1950, 1, 7, 22, 40, 0],

            [0, 'hours', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'hours', startDate, 1950, 1, 1, 1, 0, 0],
            [10, 'hours', startDate, 1950, 1, 1, 10, 0, 0],
            [100, 'hours', startDate, 1950, 1, 5, 4, 0, 0],
            [1000, 'hours', startDate, 1950, 2, 11, 16, 0, 0],
            [10000, 'hours', startDate, 1951, 2, 21, 16, 0, 0],

            [0, 'days', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'days', startDate, 1950, 1, 2, 0, 0, 0],
            [10, 'days', startDate, 1950, 1, 11, 0, 0, 0],
            [100, 'days', startDate, 1950, 4, 11, 0, 0, 0],
            [365, 'days', startDate, 1951, 1, 1, 0, 0, 0],
            [2 * 365, 'days', startDate, 1952, 1, 1, 0, 0, 0],
            [3 * 365, 'days', startDate, 1953, 1, 1, 0, 0, 0],

            // CF Conventions says to use units months' and 'years'
            // with caution. Not testing this yet because we haven't
            // implemented Calendar.msPerUnit to match CF Conventions/
            // UDUNITS yet.
        ];

        describe('toCalendarDatetime', function () {
            each(testCases).it('%d %s since %o', testToCalendarDatetime);
        });

        describe('fromDatetime', function () {
            each(testCases).it('works', testFromDatetime);
        });
    });

    describe('for Fixed360DayCalendar', function () {
        var startDate = new CalendarDatetime(fixed360DayCalendar, 1950, 1, 1);

        var testCases = [
            [0, 'seconds', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'seconds', startDate, 1950, 1, 1, 0, 0, 1],
            [10, 'seconds', startDate, 1950, 1, 1, 0, 0, 10],
            [100, 'seconds', startDate, 1950, 1, 1, 0, 1, 40],
            [1000, 'seconds', startDate, 1950, 1, 1, 0, 16, 40],
            [10000, 'seconds', startDate, 1950, 1, 1, 2, 46, 40],
            [100000, 'seconds', startDate, 1950, 1, 2, 3, 46, 40],

            [0, 'minutes', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'minutes', startDate, 1950, 1, 1, 0, 1, 0],
            [10, 'minutes', startDate, 1950, 1, 1, 0, 10, 0],
            [100, 'minutes', startDate, 1950, 1, 1, 1, 40, 0],
            [1000, 'minutes', startDate, 1950, 1, 1, 16, 40, 0],
            [10000, 'minutes', startDate, 1950, 1, 7, 22, 40, 0],

            [0, 'hours', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'hours', startDate, 1950, 1, 1, 1, 0, 0],
            [10, 'hours', startDate, 1950, 1, 1, 10, 0, 0],
            [100, 'hours', startDate, 1950, 1, 5, 4, 0, 0],
            [1000, 'hours', startDate, 1950, 2, 12, 16, 0, 0],

            [0, 'days', startDate, 1950, 1, 1, 0, 0, 0],
            [1, 'days', startDate, 1950, 1, 2, 0, 0, 0],
            [10, 'days', startDate, 1950, 1, 11, 0, 0, 0],
            [100, 'days', startDate, 1950, 4, 11, 0, 0, 0],
            [360, 'days', startDate, 1951, 1, 1, 0, 0, 0],
            [2 * 360, 'days', startDate, 1952, 1, 1, 0, 0, 0],
            [3 * 360, 'days', startDate, 1953, 1, 1, 0, 0, 0],

            // CF Conventions says to use units months' and 'years'
            // with caution. Not testing this yet because we haven't
            // implemented Calendar.msPerUnit to match CF Conventions/
            // UDUNITS yet.
        ];

        describe('toCalendarDatetime', function () {
            each(testCases).it('%d %s since %o', testToCalendarDatetime);
        });

        describe('fromDatetime', function () {
            each(testCases).it('works', testFromDatetime);
        });
    });
});


describe('', function () {
    it('', function () {

    });
});
