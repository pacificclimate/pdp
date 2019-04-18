/*globals classes */
var classes = require('./classes');

// TODO: Calendar classes are really singletons, and in JS a singleton
// should be represented by an object. Do this.


module.exports = (function (window, name) {
    // Utility functions
    
    function toInt(string) {
        return parseInt(string, 10);
    }

    function isUndefined(v) {
        return typeof v === 'undefined';
    }

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

    function appendParts(to, parts, formats) {
        var formattedParts = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (isUndefined(part)) break;
            var format = isArray(formats) ? formats[i] : formats;
            formattedParts.push(format(part));
        }
        return to + formattedParts.join('-');
    }

    function toFormattedDatetime(year, month, day, hour, minute, second) {
        var dateOnly = appendParts(
            '',
            [year, month, day],
            [format4, format2, format2]
        );
        if (dateOnly.length < 10 || isUndefined(hour)) {
            return dateOnly;
        }
        return appendParts(
            dateOnly + 'T',
            [hour, minute, second],
            format2
        );
    }

    //  class BaseDatetime
    //      static fromIso8601
    //
    //  Datetime with no calendar and, consequently, no validation (BEWARE)

    function BaseDatetime(year, month, day, hour, minute, second) {
        classes.classCallCheck(this, BaseDatetime);
        // TODO: Add some type-checking
        this.year = year;
        this.month = month || 1;
        this.day = day || 1;
        this.hour = hour || 0;
        this.minute = minute || 0;
        this.second = second || 0;
    }
    classes.addClassProperties(BaseDatetime, {
    }, {
        fromIso8601: function(string) {
            // Parses an ISO 8601 datetime string.
            // Returns a corresponding `BaseDatetime` (calendar-agnostic).
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
            return new BaseDatetime(
                toInt(match[1]), toInt(match[3]), toInt(match[5]), toInt(match[7]), toInt(match[9]), toInt(match[11])
            );
        }
    });


    // class Calendar
    //      abstract isLeapYear
    //      abstract daysPerMonth
    //      abstract daysPerYear
    //
    //      isValidTime
    //      isValidDate
    //      isValidDatetime
    //      validateDatetime
    //      msPerUnit
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
        this.epochYear = epochYear || 1900;
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
                    Calendar.toRawDatetimeFormat(year, month, day, hour, minute, second) +
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
            // See documentation `baseDatetimeFromMsSinceEpoch` for identities
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

        baseDatetimeFromMsSinceEpoch: function (ms) {
            // Returns BasedateTime representing the date that is exactly `ms`
            // milliseconds from the calendar's epoch.
            //
            // Let `cal` be a Calendar. Then the following identities hold:
            //
            //      `cal.baseDatetimeFromMsSinceEpoch(cal.msSinceEpoch(b)) = b`
            //          for all `b`: BaseDatetime
            //
            //      `cal.msSinceEpoch(cal.baseDatetimeFromMsSinceEpoch(ms))` = ms`
            //          for all `ms`: integer
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

            return new BaseDatetime(
                year, month, amounts.days + 1,
                amounts.hour, amounts.minute, amounts.second
            );
        }
    }, {
        toRawDatetimeFormat: function (year, month, day, hour, minute, second) {
            // Return a string representing the argument values in an
            // ISO 8601-like format, but without any checking or fancy formatting.
            // Useful for error messages.
            return '' + year + '-' + month + '-' + day +
                'T' + hour + '-' + minute + '-' + second;
        },

        toIso8601Format: function (year, month, day, hour, minute, second) {
            // Return a string representing the arguments in a fully compliant
            // ISO 8601 datetime format. Will flip out if the values are not
            // valid.
            return toFormattedDatetime(
                year, month, day, hour, minute, second
            );
        }

    });


    // class CalendarGregorian extends Calendar
    //
    // Concrete class for representing the Gregorian calendar

    function CalendarGregorian() {
        classes.classCallCheck(this, CalendarGregorian);
        Calendar.apply(this, arguments);
        this.type = 'standard';
        this.name = 'Gregorian';
    }
    classes.inherit(CalendarGregorian, Calendar);
    classes.addClassProperties(CalendarGregorian, {
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


    // class Calendar365Day extends Calendar
    //
    // Concrete class for representing the 365-day calendar

    function Calendar365Day() {
        classes.classCallCheck(this, Calendar365Day);
        Calendar.apply(this, arguments);
        this.type = '365_day';
        this.name = 'Fixed 365-day';
    }
    classes.inherit(Calendar365Day, Calendar);
    classes.addClassProperties(Calendar365Day, {
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


    // class Calendar360Day extends Calendar
    //
    // Concrete class for representing the 360-day calendar

    function Calendar360Day() {
        classes.classCallCheck(this, Calendar360Day);
        Calendar.apply(this, arguments);
        this.type = '360_day';
        this.name = 'Fixed 360-day';
    }
    classes.inherit(Calendar360Day, Calendar);
    classes.addClassProperties(Calendar360Day, {
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


    // class CalendarDatetime
    //      toMsSinceEpoch
    //      static fromMsSinceEpoch
    //
    // Datetime with calendar and validation relative to calendar

    function CalendarDatetime(calendar, year, month, day, hour, minute, second) {
        classes.classCallCheck(this, CalendarDatetime);
        // TODO: Add some type-checking
        this.calendar = calendar;
        this.calendar.validateDatetime(year, month, day, hour, minute, second);
        // BaseDatetime.call(this, year, month, day, hour, minute, second);
        this.datetime = new BaseDatetime(year, month, day, hour, minute, second);
    }
    classes.addClassProperties(CalendarDatetime, {
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
            var bdt = calendar.baseDatetimeFromMsSinceEpoch(ms);
            return new CalendarDatetime(
                calendar,
                bdt.year, bdt.month, bdt.day, bdt.hour, bdt.minute, bdt.second
            );
        }
    });


    // CfTimeSystem
    //
    // Represents a CF Conventions time system, which is defined by a calendar,
    // units, and a start date. In this class, the calendar is part of
    // `startDate`, which is a `CalendarDatetime`.

    function CfTimeSystem(units, startDate) {
        // Start date is specified with respect to a particular calendar.
        // `units`: `string`
        // `startDate`: `CalendarDatetime`
        // TODO: Add some type-checking
        // TODO: Add conversion from string for startDate
        classes.classCallCheck(this, CfTimeSystem);
        this.units = units;
        this.startDate = startDate;
    }


    // CfTime
    //      toCalendarDatetime
    //      static fromDatetime
    //
    // Represents a time value in a CF time system.
    //
    // A time value corresponds to an index of the time axis; the actual time
    // the index represents is determined by the CF time system.

    function CfTime(system, index) {
        // `system`: `CfTimeSystem`
        // `index`: `integer`
        // TODO: Add some type-checking
        // TODO: Reconsider what the time specifier should be - index, CalendarDateTime, string? All?
        classes.classCallCheck(this, CfTime);
        this.system = system;
        this.index = index;
    }
    classes.addClassProperties(CfTime, {
        toCalendarDatetime: function () {
            var system = this.system;
            var startDate = system.startDate;
            var calendar = startDate.calendar;

            var startMse = startDate.toMsSinceEpoch();
            var indexMse = this.index * calendar.msPerUnit(system.units);

            return CalendarDatetime.fromMsSinceEpoch(
                calendar, startMse + indexMse
            );
        }
    }, {
        fromDatetime: function (system, year, month, day, hour, minute, second) {
            // Factory method.
            // Return a CfTime in the specified system, corresponding to the
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
            return new CfTime(system, index);
        }
    });


    var exports = {
        BaseDatetime: BaseDatetime,
        Calendar: Calendar,
        CalendarGregorian: CalendarGregorian,
        Calendar365Day: Calendar365Day,
        Calendar360Day: Calendar360Day,
        CalendarDatetime: CalendarDatetime,
        CfTimeSystem: CfTimeSystem,
        CfTime: CfTime
    };

    window[name] = exports;

    return exports;
})(window, 'calendars');
