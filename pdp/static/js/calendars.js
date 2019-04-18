function intervalsPerYear(calendar, interval) {
    // Compute the number of intervals per year under the specified calendar.

    var iPerY = {
        'standard': {
            'days': 365.242
        },

        '365_day': {
            'days': 365

        },

        '360_day': {
            'days': 360
        }
    };

    switch(interval) {
        case 'days':
            return iPerY[normCalendar(calendar)][interval];
        default:
            throw('Invalid interval: ' + interval);
    }
}


function intervalsToYears(intervals, calendar, interval) {
    // Compute the (real) number of years represented by `intervals` time
    // intervals in the specified `calendar` with the length of each
    // interval specified by `interval`.
    return intervals / intervalsPerYear(calendar, interval);
}


function yearsToIntervals(years, calendar, interval) {
    // Compute the (real) number of intervals represented by `years` years
    // in the specified `calendar` with the length of each
    // interval specified by `interval`.
    return years * intervalsPerYear(calendar, interval);
}


function parseLooseIso8601Datetime(datetime) {
    var looseIso8601DateTimeRegex =
        /(\d{4})-(\d{1,2})-(\d{1,2})( |T)(\d{1,2}):(\d{1,2}):(\d{1,2})/;
    var match = looseIso8601DateTimeRegex.exec(datetime);
    if (!match) {
        return match;
    }
    return new GenericDatetime(
        match[1], match[2], match[3], match[4], match[5], match[6]);
}


// Calendar

function Calendar(type) {
    this.normalizedType = Calendar.normalizedType(type);
}

Calendar.normalizedType = function(type) {
    // Normalized calendar type.
    switch(type) {
        case 'standard':
        case 'gregorian':
        case 'proleptic_gregorian':
            return 'standard';
        case '365_day':
        case '360_day':
            return type;
        default:
            throw('Invalid calendar type: ' + type);
    }
};

Calendar.prototype.leapYear = function(year) {
    if (this.normalizedType !== 'standard') {
        return false;
    }
    if (year % 4 !== 0) {
        return false;
    }
    if (year % 100 !== 0) {
        return true;
    }
    if (year % 400 !== 0) {
        return false;
    }
    return true;
};

Calendar.prototype.daysPerYear = function(year) {
    switch(this.normalizedType) {
        case 'standard':
            // If year is specified, be precise.
            if (year) {
                if (leapYear(year)) {
                    return 366;
                }
                return 365;
            }
            // Otherwise, use the average.
            return 365.242;
        case '365_day':
            return 365;
        case '360_day':
            return 360;
    }
};

Calendar.prototype.daysPerMonth = function(year, month) {
    var nonLYDaysPerMonth =
        [null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    switch(this.normalizedType) {
        case 'standard':
            if (this.leapYear(year) && month === 2) {
                return 29;
            }
            return nonLYDaysPerMonth[month];
        case '365_day':
            return nonLYDaysPerMonth[month];
        case '360_day':
            return 30;
    }
};



// GenericDatetime

function GenericDatetime(year, month, day, hour, minute, second) {
    // Datetime with no calendar specified
    this.year = year;
    this.month = month || 1;
    this.day = day || 1;
    this.hour = hour || 0;
    this.minute = minute || 0;
    this.second = second || 0;
}


// CalendarDatetime

function CalendarDatetime(calendar, datetime) {
    // Datetime with a calendar.
    // `calendar`:`Calendar`
    // `datetime`: `GenericDatetime`
    this.calendar = calendar;
    this.datetime = datetime;
}

CalendarDatetime.epoch = new GenericDatetime(1900);  // Jan 1, 1900. Arbitrary.

CalendarDatetime.fromDaysSinceEpoch = function(calendar, daysSinceEpoch) {
    var daysRemaining = daysSinceEpoch;

    for (var year = CalendarDatetime.epoch.year;
         daysRemaining >= this.calendar.daysPerYear(year);
         year++
    ) {
        daysRemaining -= this.calendar.daysPerYear(year);
    }

    for (var month = 1;
         month < 12 && daysRemaining >= this.calendar.daysPerMonth(year, month);
         month++
    ) {
        daysRemaining -= this.calendar.daysPerMonth(year, month);
    }

    var day = Math.floor(daysRemaining) + 1;

    var datetime = new GenericDatetime(year, month, day, hour, minute, second);
    return new CalendarDatetime(calendar, datetime);
};

CalendarDatetime.prototype.toDaysSinceEpoch = function() {
    // Return the number of days since epoch for this datetime.

    // var daysPerYear = intervalsPerYear(calendar, 'days');  // ?? Better?
    // var yearContrib = (parsedDate.year - epoch.year) * daysPerYear;

    var yearContrib = 0;
    for (var year = epoch.year; year < this.datetime.year; year++) {
        yearContrib += daysPerYear(calendar, year)
    }

    var monthContrib = 0;
    for (var month = 1; month < this.datetime.month; month++) {
        monthContrib += daysPerMonth(calendar, this.datetime.year, month);
    }

    var dayContrib = this.datetime.day - 1;
    var hourContrib = this.datetime.hour / 24;
    var minuteContrib = this.datetime.minute / (24 * 60);
    var secondContrib = this.datetime.second / (24 * 60 * 60);

    return yearContrib + monthContrib + dayContrib +
        hourContrib + minuteContrib + secondContrib;
};


// TimeIndex

function TimeIndex(index, interval, startDate) {
    // Time index with interval and start date, as per CF Conventions
    // `index`: `integer`
    //  `interval`: `string`
    // `startDate`: `CalendarDateTime`
    this.index = index;
    this.interval = interval;
    this.startDate = startDate;
}

TimeIndex.prototype.toJSDate = function() {
    // Convert a time index under the system specified by `calendar`,
    // `interval`, `startDate`. to a JS Date object (in, implicitly,
    //  standard calendar).
    //  `startDate` is an ISO 8601 string interpreted in the `calendar`
    //  calendar.
    var startDateDaysSinceEpoch = this.startDate.toDaysSinceEpoch();
    var indexDays = this.index;  // Only works for interval === 'days'!!
    var dateDaysSinceEpoch = startDateDaysSinceEpoch + indexDays;

}



