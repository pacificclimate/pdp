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

    function toFormattedDatetime(format, year, month, day, hour, minute, second) {
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

    // class BaseDatetime
    // Datetime with no calendar and, consequently, no validation (BEWARE)

    function BaseDatetime(year, month, day, hour, minute, second) {
        classes.classCallCheck(this, BaseDatetime);
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
            // Parses an ISO 8601 string into a `BaseDatetime`.
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

    function Calendar() {
        classes.classCallCheck(this, Calendar);
    }
    classes.addClassProperties(Calendar, {
        isLeapYear: classes.unimplementedAbstractMethod('isLeapYear'),

        isValidTime: function (hour, minute, second) {
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
            return this.isValidDate(year, month, day) &&
                this.isValidTime(hour, minute, second);
        },

        validateDatetime: function (year, month, day, hour, minute, second) {
            if (!this.isValidDatetime(year, month, day, hour, minute, second)) {
                throw new Error(
                    'Datetime (' +
                    Calendar.toRawDatetimeFormat(year, month, day, hour, minute, second) +
                    ') is not valid for calendar type ' +
                    this.name
                )
            }
        },

        daysPerMonth: classes.unimplementedAbstractMethod('daysPerMonth'),
        daysPerYear: classes.unimplementedAbstractMethod('daysPerYear'),

        msPerUnit: function (unit, year, month) {
            switch (unit) {
                case 'second':
                case 'seconds':
                    return 1000;
                case 'minute':
                case 'minutes':
                    return 60 * this.msPerUnit('second');
                case 'hour':
                case 'hours':
                    return 60 * this.msPerUnit('minute');
                case 'day':
                case 'days':
                    return 24 * this.msPerUnit('hour');
                case 'month':
                case 'months':
                    return this.daysPerMonth(year, month) *
                        this.msPerUnit('day');
                case 'year':
                case 'years':
                    return this.daysPerYear(year) *
                        this.msPerUnit('day');
            }
        },

        msSinceEpoch: function (datetime) {
            // This works for all calendars. 
            // It is a little inefficient for the 365- and 360-day calendars.

            this.validateDatetime(
                datetime.year, datetime.month, datetime.day,
                datetime.hour, datetime.minute, datetime.second
            );
            var _this = this;
            var result = 0;

            // Add full-year contributions
            for (var year = Calendar.epochYear; year < datetime.year; year++) {
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
            var _this = this;
            var remaining = ms;

            // Remove full-year contributions
            for (var year = Calendar.epochYear;
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
        epochYear: 1900,

        toRawDatetimeFormat: function (year, month, day, hour, minute, second) {
            return '' + year + '-' + month + '-' + day +
                'T' + hour + '-' + minute + '-' + second;
        },

        toIso8601Format: function (year, month, day, hour, minute, second) {
            return toFormattedDatetime(
                format, year, month, day, hour, minute, second
            );
        }

    });


    // class CalendarGregorian extends Calendar

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

        daysPerYear: function (year) {
            return 365;
        },

        daysPerMonth: function (year, month) {
            var dpm = [null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return dpm[month];
        }
    });


    // class Calendar360Day extends Calendar

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

        daysPerYear: function (year) {
            return 360;
        },

        daysPerMonth: function (year, month) {
            return 30;
        }
    });


    // class CalendarDatetime
    // Datetime with calendar and validation

    function CalendarDatetime(calendar, year, month, day, hour, minute, second) {
        classes.classCallCheck(this, CalendarDatetime);
        this.calendar = calendar;
        this.calendar.validateDatetime(year, month, day, hour, minute, second);
        // BaseDatetime.call(this, year, month, day, hour, minute, second);
        this.datetime = new BaseDatetime(year, month, day, hour, minute, second);
    }

    classes.addClassProperties(CalendarDatetime, {
        toMsSinceEpoch: function () {
            return this.calendar.msSinceEpoch(this.datetime);
        }
    }, {
        fromMsSinceEpoch: function (calendar, ms) {
            var bdt = calendar.baseDatetimeFromMsSinceEpoch(ms);
            return new CalendarDatetime(
                calendar,
                bdt.year, bdt.month, bdt.day, bdt.hour, bdt.minute, bdt.second
            );
        }
    });


    // CfTimeSystem

    function CfTimeSystem(interval, startDate) {
        // Time system with interval and start date, as per CF Conventions.
        // Start date is specified with respect to a particular calendar.
        // `interval`: `string`
        // `startDate`: `CalendarDatetime`
        // TODO: Add conversion from string for startDate
        classes.classCallCheck(this, CfTimeSystem);
        this.interval = interval;
        this.startDate = startDate;
    }


    // CfTime

    function CfTime(system, index) {
        // Time value in a CF time system.
        // Start date is specified with respect to a particular calendar.
        // `index`: `integer`
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
            var indexMse = this.index * calendar.msPerUnit(system.interval);

            return CalendarDatetime.fromMsSinceEpoch(
                calendar, startMse + indexMse
            );
        }
    }, {
        fromDatetime: function (system, year, month, day, hour, minute, second) {
            var startDate = system.startDate;
            var calendar = startDate.calendar;
            var datetime = new CalendarDatetime(
                calendar, year, month, day, hour, minute, second
            );
            var index = Math.floor(
                (datetime.toMsSinceEpoch() - startDate.toMsSinceEpoch()) /
                calendar.msPerUnit(system.interval)
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
