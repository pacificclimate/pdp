/*globals classes */
var classes = require('./classes');

// TODO: This code is logical and works, but its API is hard to remember and
// inconvenient to use. Refactor and/or add some convenience metods.

(function () {
    // Utility functions
    
    function toInt(string) {
        if (!string) {
            return undefined;
        }
        return parseInt(string, 10);
    }

    function isUndefined(v) {
        return typeof v === 'undefined';
    }

    var isInteger = Number.isInteger;

    var isArray = Array.isArray;

    function isInRange(v, min, max) {
        return min <= v && v < max;
    }

    function format(places, num) {
        if (isUndefined(num)) {
            return undefined;
        }
        var s = '00000000000' + num;
        return s.substr(s.length - places);
    }

    var format2 = format.bind(this, 2);
    var format4 = format.bind(this, 4);

    function appendParts(to, parts, formats, sep) {
        var formattedParts = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (isUndefined(part)) break;
            var format = isArray(formats) ? formats[i] : formats;
            formattedParts.push(format(part));
        }
        return to + formattedParts.join(sep);
    }

    function makeFormatDatetime(formats, ymdSep, timeDelim, hmsSep) {
        return function formatDateTime(year, month, day, hour, minute, second) {
            var dateOnly = appendParts(
                '',
                [year, month, day],
                formats,
                ymdSep
            );
            if (dateOnly.length < 10 || isUndefined(hour)) {
                return dateOnly;
            }
            return appendParts(
                dateOnly + timeDelim,
                [hour, minute, second],
                isArray(formats) ? formats.slice(3) : formats,
                hmsSep
            );
        }
    }


    function formatDatetimeRaw(year, month, day, hour, minute, second) {
        // Return a string representing the argument values in an
        // ISO 8601-like format, but without any checking or fancy formatting.
        // Useful for error messages.
        return '' + year + '-' + month + '-' + day +
            'T' + hour + '-' + minute + '-' + second;
    }

    var formatDatetimeISO8601 = makeFormatDatetime(
        [format4, format2, format2, format2, format2, format2],
        '-', 'T', ':'
    );

    var formatDatetimeLoose = makeFormatDatetime(
        [format4, format2, format2, format2, format2, format2],
        '/', ' ', ':'
    );

    //  class SimpleDatetime
    //      static fromIso8601
    //
    //  Datetime with no calendar and, consequently, no validation (BEWARE)

    function SimpleDatetime(year, month, day, hour, minute, second) {
        classes.classCallCheck(this, SimpleDatetime);
        if (isUndefined(year)) {
            throw new Error('Year must be defined');
        }
        var consArgs = arguments;
        ['year', 'month', 'day', 'hour', 'minute', 'second']
        .forEach(function (name, i) {
            var arg = consArgs[i];
            if(!(isUndefined(arg) || isInteger(arg))) {
                throw new Error(
                    'Parameter "' + name + '" must be undefined or an integer, but was ' + arg);
            }
        });
        this.year = year;
        this.month = month || 1;
        this.day = day || 1;
        this.hour = hour || 0;
        this.minute = minute || 0;
        this.second = second || 0;
    }
    classes.addClassProperties(SimpleDatetime, {
        toISOString: function(dateOnly) {
            if (dateOnly) {
                return formatDatetimeISO8601(
                    this.year, this.month, this.day
                );
            }
            return formatDatetimeISO8601(
                this.year, this.month, this.day,
                this.hour, this.minute, this.second
            );
        },

        toLooseString: function(dateOnly) {
            if (dateOnly) {
                return formatDatetimeLoose(
                    this.year, this.month, this.day
                );
            }
            return formatDatetimeLoose(
                this.year, this.month, this.day,
                this.hour, this.minute, this.second
            );
        }
    }, {
        fromIso8601: function(string) {
            // Parses an ISO 8601 datetime string.
            // Returns a corresponding `SimpleDatetime` (calendar-agnostic).
            // Returns `null` if the string is not a valid ISO 8601
            // datetime string.
            //
            // This is a loose ISO 8601 parser, in two senses:
            //  - It is more forgiving than the standard. It allows 1-digit
            //      month, day, hour, minute, and second values.
            //  - It parses only a subset of the standard, specifically only
            //      date and time

            var looseIso8601Regex =
                /^(\d{4})(-(\d{1,2}))?(-(\d{1,2}))?([ T](\d{1,2})(:(\d{1,2}))?(:(\d{1,2}))?)?$/;
            var match = looseIso8601Regex.exec(string);
            if (!match) {
                return match;
            }
            return new SimpleDatetime(
                toInt(match[1]), toInt(match[3]), toInt(match[5]), toInt(match[7]), toInt(match[9]), toInt(match[11])
            );
        },

        fromLooseFormat: function(dateString) {
            // Parses a loose-formatted date string.
            var looseFormatRegex = /^\s*(\d{4})([\/-](\d{1,2}))?([\/-](\d{1,2}))?\s*$/;
            var match = looseFormatRegex.exec(dateString);
            if (!match) {
                return match;
            }
            return new SimpleDatetime(
                toInt(match[1]), toInt(match[3]), toInt(match[5])
            );
        }
    });


    // class Calendar
    //      epochYear
    //      abstract type
    //      abstract name
    //
    //      abstract isLeapYear()
    //      abstract daysPerMonth()
    //      abstract daysPerYear()
    //
    //      isValidTime()
    //      isValidDate()
    //      isValidDatetime()
    //      validateDatetime()
    //      msPerUnit()
    //      msSinceEpoch()
    //      simpleDatetimeFromMsSinceEpoch()
    //
    //      static toRawDatetimeFormat()
    //
    // Base class for calendar classes.
    //
    // Represents a calendar in the sense of a system of managing and relating
    // time units of seconds, minutes, hours, days, months, years.
    //
    // Specialized to a concrete calendar by defining the abstract methods
    // `isLeapYear`, `daysPerMonth`, `daysPerYear`.

    function Calendar(epochYear) {
        classes.classCallCheck(this, Calendar);
        this.epochYear = epochYear || 1800;
    }
    classes.addClassProperties(Calendar, {
        isLeapYear: classes.unimplementedAbstractMethod('isLeapYear'),
        daysPerMonth: classes.unimplementedAbstractMethod('daysPerMonth'),
        daysPerYear: classes.unimplementedAbstractMethod('daysPerYear'),

        isValidTime: function (hour, minute, second) {
            // Self-explanatory
            // TODO: Add some type-checking
            var result = true;
            if (isUndefined(hour)) {
                result = result && isUndefined(minute) && isUndefined(second);
            } else {
                result = result && isInRange(hour, 0, 24);
            }
            if (isUndefined(minute)) {
                result = result && isUndefined(second);
            } else {
                result = result && isInRange(minute, 0, 60);
            }
            if (!isUndefined(second)) {
                result = result && isInRange(second, 0, 60);
            }
            return result;
        },

        isValidDate: function (year, month, day) {
            // Self-explanatory
            // TODO: Add some type-checking
            var result = true;
            if (isUndefined(year)) {
                result = false;
            }
            if (isUndefined(month)) {
                result = result && isUndefined(day);
            } else {
                result = result && isInRange(month, 1, 13);
            }
            if (!isUndefined(day)) {
                result = result &&
                    isInRange(day, 1, this.daysPerMonth(year, month) + 1);
            }
            return result;
        },

        isValidDatetime: function (year, month, day, hour, minute, second) {
            // Self-explanatory
            return this.isValidDate(year, month, day) &&
                this.isValidTime(hour, minute, second);
        },

        validateDatetime: function (year, month, day, hour, minute, second) {
            // Throw an error if the date and time are not valid.
            if (!this.isValidDatetime(year, month, day, hour, minute, second)) {
                throw new Error(
                    'Datetime (' +
                    formatDatetimeRaw(year, month, day, hour, minute, second) +
                    ') is not valid for calendar type ' +
                    this.name
                )
            }
        },

        msPerUnit: function (unit, year, month) {
            // Return the number of milliseconds per unit.
            // For the units 'month' and 'year', the value is (potentially)
            // dependent on the year and month within the calendar.
            switch (unit) {
                case 's':
                case 'sec':
                case 'second':
                case 'seconds':
                    return 1000;
                case 'min':
                case 'minute':
                case 'minutes':
                    return 60 * this.msPerUnit('second');
                case 'h':
                case 'hr':
                case 'hour':
                case 'hours':
                    return 60 * this.msPerUnit('minute');
                case 'd':
                case 'day':
                case 'days':
                    return 24 * this.msPerUnit('hour');
                case 'month':
                case 'months':
                    return this.daysPerMonth(year, month) *
                        this.msPerUnit('day');
                case 'y':
                case 'yr':
                case 'year':
                case 'years':
                    return this.daysPerYear(year) *
                        this.msPerUnit('day');
                default:
                    throw new Error('Invalid time unit: ' + unit);
            }
        },

        msSinceEpoch: function (datetime) {
            // Returns the number of milliseconds since the epoch, which
            // is defined as the (calendar-agnostic) date Jan 1, <epochYear>.
            //
            // Throws an error if the datetime supplied is not valid for the
            // calendar.
            //
            // This algorithm works correctly for all calendars.
            // It is a little inefficient for the 365- and 360-day calendars,
            // and could be overridden in those cases if efficiency is a
            // concern.
            //
            // See documentation `simpleDatetimeFromMsSinceEpoch` for identities
            // that hold between these two methods.

            this.validateDatetime(
                datetime.year, datetime.month, datetime.day,
                datetime.hour, datetime.minute, datetime.second
            );
            var _this = this;
            var result = 0;

            // Add full-year contributions
            for (var year = this.epochYear; year < datetime.year; year++) {
                result += _this.msPerUnit('year', year);
            }

            // Add full-month contributions
            for (var month = 1; month < datetime.month; month++) {
                result += _this.msPerUnit('month', datetime.year, month);
            }

            // Add full-day contributions
            result += (datetime.day - 1) * _this.msPerUnit('day');

            // Add time (part-day) contributions
            ['hour', 'minute', 'second'].forEach(function (unit) {
                result += datetime[unit] * _this.msPerUnit(unit);
            });

            return result;
        },

        simpleDatetimeFromMsSinceEpoch: function (ms) {
            // Returns a `SimpleDatetime` representing the date that is 
            // exactly `ms` milliseconds from the calendar's epoch.
            //
            // Let `cal` be a Calendar. Then the following identities hold:
            //
            //      `cal.simpleDatetimeFromMsSinceEpoch(cal.msSinceEpoch(b)) = b`
            //          for all `b`: `SimpleDatetime`
            //
            //      `cal.msSinceEpoch(cal.simpleDatetimeFromMsSinceEpoch(ms))` = ms`
            //          for all `ms`: `integer`
            var _this = this;
            var remaining = ms;

            // Remove full-year contributions
            for (var year = this.epochYear;
                 remaining >= _this.msPerUnit('year', year);
                 year++
            ) {
                remaining -= _this.msPerUnit('year', year);
            }

            // Remove full-month contributions
            for (var month = 1;
                 remaining >= _this.msPerUnit('month', year, month);
                 month++
            ) {
                remaining -= _this.msPerUnit('month', year, month);
            }

            // Calculate the lower-order components.
            var amounts = {};
            ['days', 'hour', 'minute', 'second'].forEach(function (unit) {
                var msPer = _this.msPerUnit(unit);
                var amount = Math.floor(remaining / msPer);
                amounts[unit] = amount;
                remaining -= amount * msPer;
            });

            return new SimpleDatetime(
                year, month, amounts.days + 1,
                amounts.hour, amounts.minute, amounts.second
            );
        }
    }, {
        validUnits: [
            's', 'sec', 'second', 'seconds',
            'min', 'minute', 'minutes',
            'h', 'hr', 'hour', 'hours',
            'd', 'day', 'days',
            'month', 'months',
            'y', 'yr', 'year', 'years'
        ],


        isValidUnit: function(unit) {
            return Calendar.validUnits.indexOf(unit) !== -1;
        },

        validateUnit: function(unit) {
            if (!Calendar.isValidUnit(unit)) {
                throw new Error('Invalid time unit: ' + unit);
            }
        },
    });


    // class GregorianCalendar extends Calendar
    //
    // Concrete class for representing the Gregorian calendar

    function GregorianCalendar() {
        classes.classCallCheck(this, GregorianCalendar);
        Calendar.apply(this, arguments);
        this.type = 'standard';
        this.name = 'Gregorian';
    }
    classes.inherit(GregorianCalendar, Calendar);
    classes.addClassProperties(GregorianCalendar, {
        isLeapYear: function (year) {
            if (year % 4 !== 0) {
                return false;
            }
            if (year % 100 !== 0) {
                return true;
            }
            return year % 400 === 0;
        },

        daysPerYear: function (year) {
            if (this.isLeapYear(year)) {
                return 366;
            }
            return 365;
        },

        daysPerMonth: function (year, month) {
            var dpm = [null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (this.isLeapYear(year) && month === 2) {
                return 29;
            }
            return dpm[month];
        }
    });


    // class Fixed365DayCalendar extends Calendar
    //
    // Concrete class for representing the 365-day calendar

    function Fixed365DayCalendar() {
        classes.classCallCheck(this, Fixed365DayCalendar);
        Calendar.apply(this, arguments);
        this.type = '365_day';
        this.name = 'Fixed 365-day';
    }
    classes.inherit(Fixed365DayCalendar, Calendar);
    classes.addClassProperties(Fixed365DayCalendar, {
        isLeapYear: function () {
            return false;
        },

        daysPerYear: function () {
            return 365;
        },

        daysPerMonth: function (year, month) {
            var dpm = [null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return dpm[month];
        }
    });


    // class Fixed360DayCalendar extends Calendar
    //
    // Concrete class for representing the 360-day calendar

    function Fixed360DayCalendar() {
        classes.classCallCheck(this, Fixed360DayCalendar);
        Calendar.apply(this, arguments);
        this.type = '360_day';
        this.name = 'Fixed 360-day';
    }
    classes.inherit(Fixed360DayCalendar, Calendar);
    classes.addClassProperties(Fixed360DayCalendar, {
        isLeapYear: function () {
            return false;
        },

        daysPerYear: function () {
            return 360;
        },

        daysPerMonth: function () {
            return 30;
        }
    });


    // class CalendarFactory
    //      epochYear
    //
    //      createCalendar()
    //
    //      static calendarTypes

    function CalendarFactory(epochYear) {
        this.epochYear = epochYear;
    }
    classes.addClassProperties(CalendarFactory, {
        createCalendar: function(type) {
            // Note we do not presently make any distinction between standard,
            // Gregorian, and proleptic Gregorian calendars. This is actually wrong,
            // but it will do.
            switch (type) {
                case 'standard':
                case 'gregorian':
                case 'proleptic_gregorian':
                    return new GregorianCalendar(this.epochYear);
                case '365_day':
                    return new Fixed365DayCalendar(this.epochYear);
                case '360_day':
                    return new Fixed360DayCalendar(this.epochYear);
                default:
                    throw new Error('Unknown calendar type: ', type);
            }
        }
    }, {
        calendarTypes: [
            'standard', 'gregorian', 'proleptic_gregorian',
            '365_day', '360_day'
        ]
    });


    // class CalendarDatetime
    //      calendar
    //      datetime
    //
    //      toMsSinceEpoch()
    //
    //      static fromMsSinceEpoch()
    //
    // Datetime with calendar and validation relative to calendar

    function CalendarDatetime(
        calendar, sdtOrYear, month, day, hour, minute, second
    ) {
        classes.classCallCheck(this, CalendarDatetime);
        classes.validateClass(calendar, Calendar);
        this.calendar = calendar;

        var datetime;
        if (sdtOrYear instanceof SimpleDatetime) {
            datetime = sdtOrYear;
        } else {
            datetime = new SimpleDatetime(
                sdtOrYear, month, day, hour, minute, second);
        }
        calendar.validateDatetime(
            datetime.year, datetime.month, datetime.day,
            datetime.hour, datetime.minute, datetime.second
        );
        this.datetime = datetime;
    }
    classes.addClassProperties(CalendarDatetime, {
        toISOString: function() {
            return this.datetime.toISOString();
        },

        toLooseString: function(dateOnly) {
            return this.datetime.toLooseString(dateOnly);
        },

        toMsSinceEpoch: function () {
            // Returns the number of milliseconds between the calendar's epoch
            // and this datetime.
            return this.calendar.msSinceEpoch(this.datetime);
        }
    }, {
        fromMsSinceEpoch: function (calendar, ms) {
            // Factory method
            // Returns a CalendarDatetime that is the specified number of
            // milliseconds since the calendar's epoch.
            var sdt = calendar.simpleDatetimeFromMsSinceEpoch(ms);
            return new CalendarDatetime(
                calendar,
                sdt.year, sdt.month, sdt.day, sdt.hour, sdt.minute, sdt.second
            );
        }
    });


    // CfTimeSystem
    //      units
    //      startDate
    //
    // Represents a CF Conventions time system, which is defined by a calendar,
    // units, and a start date. In this class, the calendar is part of
    // `startDate`, which is a `CalendarDatetime`.

    function CfTimeSystem(units, startDate, indexCount) {
        // Start date is specified with respect to a particular calendar.
        // `units`: `string`
        // `startDate`: `CalendarDatetime`
        // `indexCount`: `int`
        // TODO: Add conversion from string for startDate
        classes.classCallCheck(this, CfTimeSystem);
        Calendar.validateUnit(units);
        if (!(startDate instanceof CalendarDatetime)) {
            throw new Error('startDate must be a CalendarDatetime');
        }
        classes.validateClass(startDate, CalendarDatetime);
        this.units = units;
        this.startDate = startDate;
        this.indexCount = indexCount;
    }
    classes.addClassProperties(CfTimeSystem, {
        firstCfDatetime: function() {
            // Return first date (start date, index 0) in this time system as
            // a `CfDatetime`
            return new CfDatetime(this, 0);
        },

        lastCfDatetime: function() {
            // Return last date (start date, index `indexCount-1`) in this
            // time system as a `CfDatetime`.
            // If `indexCount` is undefined, return undefined.
            if (this.indexCount) {
                return new CfDatetime(this, this.indexCount-1);
            }
            return undefined;
        }
    }, {
    });

    // CfDatetime
    //      system
    //      index
    //
    //      toCalendarDatetime()
    //
    //      static fromDatetime()
    //
    // Represents a time value in a CF time system.
    //
    // A CF datetime value corresponds to an index of the time axis; the actual
    // datetime that the index represents is determined by the CF time system,
    // and is defined as the datetime that is exactly index * unit-length
    // after the start date.

    function CfDatetime(system, index) {
        // `system`: `CfTimeSystem`
        // `index`: `integer`
        classes.classCallCheck(this, CfDatetime);
        classes.validateClass(system, CfTimeSystem, 'system');
        this.system = system;
        this.index = index;
    }
    classes.addClassProperties(CfDatetime, {
        validateIndex: function(index) {
            if (index < 0) {
                throw new Error('Index must be >= 0');
            }
            if (this.system.indexCount && index >= this.system.indexCount) {
                throw new Error('Index must be < ' + system.indexCount);
            }
        },

        setIndex: function(index) {
            this.validateIndex(index);
            this.index = index;
        },

        toIndex: function() {
            return this.index;
        },

        toCalendarDatetime: function () {
            var system = this.system;
            var startDate = system.startDate;
            var calendar = startDate.calendar;

            var startMse = startDate.toMsSinceEpoch();
            var indexMse = this.index * calendar.msPerUnit(system.units);

            return CalendarDatetime.fromMsSinceEpoch(
                calendar, startMse + indexMse
            );
        },

        toISOString: function() {
            return this.toCalendarDatetime().toISOString();
        },

        toLooseString: function(dateOnly) {
            return this.toCalendarDatetime().toLooseString(dateOnly);
        },

        toLooseDatetimeFormat: function() {
            return this.toCalendarDatetime().toLooseDatetimeFormat();
        }
    }, {
        fromDatetime: function (system, year, month, day, hour, minute, second) {
            // Factory method.
            // Return a CfDatetime in the specified system, corresponding to the
            // specified datetime.
            var startDate = system.startDate;
            var calendar = startDate.calendar;
            var datetime = new CalendarDatetime(
                calendar, year, month, day, hour, minute, second
            );
            var index = Math.floor(
                (datetime.toMsSinceEpoch() - startDate.toMsSinceEpoch()) /
                calendar.msPerUnit(system.units)
            );
            return new CfDatetime(system, index);
        },

        fromLooseFormat: function(system, string) {
            var sdt = SimpleDatetime.fromLooseFormat(string);
            return CfDatetime.fromDatetime(
                system,
                sdt.year, sdt.month, sdt.day,
                sdt.hour, sdt.minute, sdt.second
            );
        }
    });


    var exports = {
        formatDatetimeRaw: formatDatetimeRaw,
        formatDatetimeISO8601: formatDatetimeISO8601,
        SimpleDatetime: SimpleDatetime,
        Calendar: Calendar,
        GregorianCalendar: GregorianCalendar,
        Fixed365DayCalendar: Fixed365DayCalendar,
        Fixed360DayCalendar: Fixed360DayCalendar,
        CalendarFactory: CalendarFactory,
        CalendarDatetime: CalendarDatetime,
        CfTimeSystem: CfTimeSystem,
        CfDatetime: CfDatetime
    };

    // Predefined convenience calendars.
    var calendarFactory = new CalendarFactory();
    CalendarFactory.calendarTypes.forEach(function(type) {
        exports[type] = calendarFactory.createCalendar(type);
    });

    condExport(module, exports, 'calendars');
})();
