var each = require('jest-each').default;  // WTF?

var calendars = require('../calendars.new');
var BaseDatetime = calendars.BaseDatetime;
var Calendar = calendars.Calendar;
var CalendarGregorian = calendars.CalendarGregorian;
var Calendar365Day = calendars.Calendar365Day;
var Calendar360Day = calendars.Calendar360Day;
var CalendarDatetime = calendars.CalendarDatetime;
var CfTimeIndex = calendars.CfTimeIndex;

var calendarGregorian = new CalendarGregorian();
var calendar365Day = new Calendar365Day();
var calendar360Day = new Calendar360Day();


// A true universal, upon which we all can agree.
var msPerDay = 1000 * 60 * 60 * 24;

function leapDaysSinceEpoch(year) {
    // Up and including `year`.
    // Valid only up to 2099!!!
    return Math.floor((year - Calendar.epochYear) / 4);
}


describe('all classes', function () {
    each([
        calendars.BaseDatetime,
        calendars.Calendar,
        calendars.CalendarGregorian,
        calendars.Calendar365Day,
        calendars.Calendar360Day,
        calendars.CalendarDatetime,
        calendars.CfTimeIndex
    ]).describe('%s', function (Class) {
        it('cannot be called as a function', function () {
            expect(function () {
                Class()
            }).toThrow();
        });
    });
});


describe('BaseDatetime', function () {
    it('holds the data', function () {
        var baseDatetime = new BaseDatetime(0, 1, 2, 3, 4, 5)
        expect(baseDatetime.year).toBe(0);
        expect(baseDatetime.month).toBe(1);
        expect(baseDatetime.day).toBe(2);
        expect(baseDatetime.hour).toBe(3);
        expect(baseDatetime.minute).toBe(4);
        expect(baseDatetime.second).toBe(5);
    });

    it('provides defaults', function () {
        var baseDatetime = new BaseDatetime(999);
        ['month', 'day'].forEach(function (prop) {
            expect(baseDatetime[prop]).toBe(1);
        });
        ['hour', 'minute', 'second'].forEach(function (prop) {
            expect(baseDatetime[prop]).toBe(0);
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

    describe('toIso8601Format', function () {
        each([
            [1900, 1, 2, 3, 4, 5, '1900-01-02T03-04-05'],
            [1900, 11, 12, 13, 14, 15, '1900-11-12T13-14-15'],
            [undefined, 11, 12, 13, 14, 15, ''],
            [1900, undefined, 12, 13, 14, 15, '1900'],
            [1900, 11, undefined, 13, 14, 15, '1900-11'],
            [1900, 11, 12, undefined, 14, 15, '1900-11-12'],
            [1900, 11, 12, 13, undefined, 15, '1900-11-12T13'],
            [1900, 11, 12, 13, 14, undefined, '1900-11-12T13-14'],
        ]).it('%#',
            function (year, month, day, hour, minute, second, expected) {
                expect(Calendar.toIso8601Format(
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


describe('CalendarGregorian', function () {
    var calendar = new CalendarGregorian();

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
        [new BaseDatetime(1900),
            0],
        [new BaseDatetime(1900, 1, 1, 0, 0, 1),
            1000],
        [new BaseDatetime(1900, 1, 1, 0, 1, 0),
            1000 * 60],
        [new BaseDatetime(1900, 1, 1, 1, 0, 0),
            1000 * 60 * 60],
        [new BaseDatetime(1900, 1, 2),
            msPerDay],
        [new BaseDatetime(1900, 1, 3),
            msPerDay * 2],
        [new BaseDatetime(1900, 1, 31),
            msPerDay * 30],
        [new BaseDatetime(1900, 2, 1),
            msPerDay * 31],
        [new BaseDatetime(1900, 3, 1),
            msPerDay * (31 + 28)],
        [new BaseDatetime(1900, 4, 1),
            msPerDay * (31 + 28 + 31)],
        [new BaseDatetime(1900, 12, 1),
            msPerDay * (365 - 31)],
        [new BaseDatetime(1901, 1, 1),
            msPerDay * 365],
        [new BaseDatetime(1950, 1, 1),
            msPerDay * (50 * 365 + leapDaysSinceEpoch(1949))],
        [new BaseDatetime(2000, 1, 1),
            msPerDay * (100 * 365 + leapDaysSinceEpoch(1999))]
    ];

    describe('msSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts FROM %o TO %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.msSinceEpoch(datetime)).toBe(ms);
            });
    });

    describe('baseDatetimeFromMsSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts TO %o FROM %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.baseDatetimeFromMsSinceEpoch(ms)).toEqual(datetime);
            });
    });
});


describe('Calendar365Day', function () {
    var calendar = new Calendar365Day();

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
        [new BaseDatetime(1900),
            0],
        [new BaseDatetime(1900, 1, 1, 0, 0, 1),
            1000],
        [new BaseDatetime(1900, 1, 1, 0, 1, 0),
            1000 * 60],
        [new BaseDatetime(1900, 1, 1, 1, 0, 0),
            1000 * 60 * 60],
        [new BaseDatetime(1900, 1, 2),
            msPerDay],
        [new BaseDatetime(1900, 1, 3),
            msPerDay * 2],
        [new BaseDatetime(1900, 1, 31),
            msPerDay * 30],
        [new BaseDatetime(1900, 2, 1),
            msPerDay * 31],
        [new BaseDatetime(1900, 3, 1),
            msPerDay * (31 + 28)],
        [new BaseDatetime(1900, 4, 1),
            msPerDay * (31 + 28 + 31)],
        [new BaseDatetime(1900, 12, 1),
            msPerDay * (365 - 31)],
        [new BaseDatetime(1901, 1, 1),
            msPerDay * 365],
        [new BaseDatetime(1950, 1, 1),
            msPerDay * (50 * 365)],
        [new BaseDatetime(2000, 1, 1),
            msPerDay * (100 * 365)]
    ];

    describe('msSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts FROM %o TO %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.msSinceEpoch(datetime)).toBe(ms);
            });
    });

    describe('baseDatetimeFromMsSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts TO %o FROM %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.baseDatetimeFromMsSinceEpoch(ms)).toEqual(datetime);
            });
    });
});


describe('Calendar360Day', function () {
    var calendar = new Calendar360Day();

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
        [new BaseDatetime(1900),
            0],
        [new BaseDatetime(1900, 1, 1, 0, 0, 1),
            1000],
        [new BaseDatetime(1900, 1, 1, 0, 1, 0),
            1000 * 60],
        [new BaseDatetime(1900, 1, 1, 1, 0, 0),
            1000 * 60 * 60],
        [new BaseDatetime(1900, 1, 2),
            msPerDay],
        [new BaseDatetime(1900, 1, 3),
            msPerDay * 2],
        [new BaseDatetime(1900, 1, 30),
            msPerDay * 29],
        [new BaseDatetime(1900, 2, 1),
            msPerDay * 30],
        [new BaseDatetime(1900, 3, 1),
            msPerDay * 30 * 2],
        [new BaseDatetime(1900, 4, 1),
            msPerDay * 30 * 3],
        [new BaseDatetime(1900, 12, 1),
            msPerDay * 30 * 11],
        [new BaseDatetime(1901, 1, 1),
            msPerDay * 360],
        [new BaseDatetime(1950, 1, 1),
            msPerDay * (50 * 360)],
        [new BaseDatetime(2000, 1, 1),
            msPerDay * (100 * 360)]
    ];

    describe('msSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts FROM %o TO %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.msSinceEpoch(datetime)).toBe(ms);
            });
    });

    describe('baseDatetimeFromMsSinceEpoch', function () {
        each(dateTimeMsSinceEpoch)
        .it('correctly converts TO %o FROM %d ms since epoch',
            function (datetime, ms) {
                expect(calendar.baseDatetimeFromMsSinceEpoch(ms)).toEqual(datetime);
            });
    });
});


describe('CalendarDatetime', function () {
    describe('toMsSinceEpoch', function () {
        each([
            [calendarGregorian, 1900, 1, 1, 0, 0, 0, 0],
            [calendar365Day, 1900, 1, 1, 0, 0, 0, 0],
            [calendar360Day, 1900, 1, 1, 0, 0, 0, 0],

            [calendarGregorian, 1950, 1, 1, 0, 0, 0,
                msPerDay * (50 * 365 + leapDaysSinceEpoch(1949))],
            [calendar365Day, 1950, 1, 1, 0, 0, 0,
                msPerDay * (50 * 365)],
            [calendar360Day, 1950, 1, 1, 0, 0, 0,
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


describe('CfTimeIndex', function () {
    describe('toCalendarDatetime', function () {
        function testToCalendarDatetime(index, interval, startDate, expected) {
            var cfTimeIndex = new CfTimeIndex(index, interval, startDate);
            expect(cfTimeIndex.toCalendarDatetime()).toEqual(expected);
        }

        describe('for CalendarGregorian', function () {
            var startDate = new CalendarDatetime(calendarGregorian, 1950, 1, 1);

            each([
                [0, 'days', startDate, startDate],
                [1, 'days', startDate,
                    new CalendarDatetime(calendarGregorian, 1950, 1, 2)],
                [10, 'days', startDate,
                    new CalendarDatetime(calendarGregorian, 1950, 1, 11)],
                [100, 'days', startDate,
                    new CalendarDatetime(calendarGregorian, 1950, 4, 11)],
            ]).it('%d %s since %o', testToCalendarDatetime);
        });
    });
});


describe('', function () {
    it('', function () {

    });
});
