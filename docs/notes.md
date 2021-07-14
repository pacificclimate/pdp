# Notes

Any miscellaneous information about the project or its modules can be found here.

- [Notes](#notes)
  - [Module `calendars`](#module-calendars)
    - [Introductory notes](#introductory-notes)
    - [Calendars](#calendars)
    - [Datetimes (in specific calendars)](#datetimes-in-specific-calendars)
    - [CF time systems](#cf-time-systems)
    - [Usage](#usage)
      - [`CalendarDatetime`: Datetimes in various calendars](#calendardatetime-datetimes-in-various-calendars)
      - [`CfTimeSystem`: CF time systems](#cftimesystem-cf-time-systems)
      - [`CfDatetime`: CF time points](#cfdatetime-cf-time-points)

## Module `calendars`

### Introductory notes

- In this section, we use the term `class`, a concept which strictly speaking JS doesn't support. However, we use JS patterns that emulate class-based code fairly closely; in particular, that emulate many of the features of the ES6 `class` syntactic sugar. This is currently done via the utilities provided in module `classes`.

- Objects that can be instantiated with these constructors are mutable, but few if any mutation methods are provided. This is because mutation makes code hard to reason about (it removes [referential transparency](https://nrinaudo.github.io/scala-best-practices/definitions/referential_transparency.html)). Instead of mutation, prefer to create a new object containing the new value, rather than mutating an old object.

### Calendars

PDP datasets use a variety of different, mutually incompatible calendar systems. These systems include:

- Standard or Gregorian calendar.
- 365-day calendar: Like the Gregorian calendar, but without leap years.
- 360-day calendar: Every month in every year has exactly 30 days.

JavaScript directly supports only the Gregorian calendar, via the `Date` object. It is not possible (whilst retaining developer sanity, or code maintainability) to handle non-Gregorian calendars using a Gregorian calendar. Previous code that attempted to do so contained errors traceable to the incompatibility of different calendar systems.

To address this situation, we have defined a module `calendars` containing the following items:

- Class `Calendar`, which represents the general notion of a calendar, and subclasses `GregorianCalendar`, `Fixed365DayCalendar`, `Fixed360DayCalendar`, which represent specific, different calendar types.
   - Rightly or wrongly, `Calendar`s are used as instances (so far we have only discussed things that could be equally well be supplied by a fixed object, or singleton).
   - Each `Calendar` instance has an epoch year, which defines the epoch or origin date for computations the calendar can perform. Dates before Jan 1 of the epoch year are not valid. This is stupid, a result of lazy implementation, but it is true for now. Default epoch year is 1800.
   - `Calendar` has abstract methods `isLeapYear()`,  `daysPerMonth()`, `daysPerYear()` that concrete subclasses define in order to specify different particular calendars.
   - `Calendar` provides a number of service methods for validating datetimes and for computing essential quantities, such as the number of milliseconds since epoch. These are fundamental to datetime computations within
   any given calendar system.

Most users of this module will not need to define their own `Calendar` subclasses, nor their own instances of those subclasses (specifying `epochYear`), since the provided standard instances are designed to meet known use cases in PDP. However, the option is there for unforeseen applications.

- The standard (and default) `epochYear` is 1800.
- The `calendars` module offers pre-instantiated standard calendars of each type, indexed by the standard CF identifiers
for each type:
   - `calendars['standard']`,`calendars['gregorian']`
   - `calendars['365_day']`, `calendars['noleap']`
   - `calendars['360_day']`

### Datetimes (in specific calendars)

The following classes exploit `Calendar` objects to represent datetimes in specific calendrical systems.

- Class `SimpleDatetime` that bundles together the `year`, `month`, `day`, etc. components of a datetime,
_without reference to any specific calendar_.

- Class `CalendarDatetime` composes a `Calendar` with a `SimpleDatetime`, to represent a datetime in a particular calendar. (Note: We [prefer composition over inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance).)
   - At the moment, it offers only conversion methods (e.g., `toISOString()`) and factories (e.g., `fromMsSinceEpoch()`).
   - This would be the class in which to place calendar-aware datetime arithmetic methods (e.g., `addDays()`), but we have no use for this in present applications so the class lacks such methods.

### CF time systems

In CF standards compliant datasets, datetimes are represented by index values (values of the time dimension) in a time system defined by units, start datetime, and calendar.

- Units are fixed intervals of time labelled by terms such as 'day', 'hour', 'minute'.
- A start datetime is a specification of year, month, day, etc., in a specified calendar system.
- The calendar is specified an identifier chosen from a fixed CF vocabulary that includes 'standard', 'gregorian', '365_day', 'noleap', and '360_day', with the obvious meanings.
- A time index _t_ specifies a time point defined as _t_ time units after the start datetime, in the specified calendar.

The following classes represent time systems and datetimes within such a system:

- Class `CfTimeSystem`, which represents a CF time system, as above.
  - Constructed with arguments `units` and `startDate`; the latter is a `CalendarDatetime`, which carries both the calendar and the datetime. This is one of the places where method signature is hard to remember, and could perhaps be improved.

- Class `CfDatetime`, which [composes](https://en.wikipedia.org/wiki/Composition_over_inheritance) a
`CfTimeSystem` and a real-valued index to represent a specific time within a CF time system.
   - Like `CalendarDatetime` (to which it is a parallel), `CfDatetime` offers only conversion methods (e.g., `toISOString()`, `toCalendarDatetime`) and factories (e.g., `fromLooseFormat()`).
   - Like `CalendarDatetime`, this is the class in which time arithmetic methods would be placed, but none are currently needed, so none exist.

### Usage

Playing at classes is all very well, till somebody loses their mind. How is this intended to be used?

Here are some code snippets that show the application of these objects. Some make it obvious that it would be nicer to have (a) more consistent and/or flexible method signatures, and (b) more helper methods.

#### `CalendarDatetime`: Datetimes in various calendars

```javascript
// Date in Gregorian calendar.
const apollo11 = new CalendarDatetime(new GregorianCalendar(), 1969, 7, 20);
console.log(apollo11.toISOString()); // -> 1969-07-20T00:00:00
console.log(apollo11.toISOString(true)); // -> 1969-07-20

// Or, using the pre-instantiated Gregorian calendar.
const apollo11 = new CalendarDatetime(calendars.gregorian, 1969, 7, 20);

// Dates in non-Gregorian calendar
const endOfCentury = new CalendarDatetime(calendars['365_day'], 2099, 12, 31);
console.log(endOfCentury.toLooseString()); // -> 2099/12/31 00:00:00
console.log(endOfCentury.toLooseString(true)); // -> 2099/12/31
```

#### `CfTimeSystem`: CF time systems

```javascript
// A CF time system: days since 1950-01-01 in 360-day calendar; maximum time index 99999.
const sinceDate = new CalendarDatetime(calendars['360_day'], 1950, 1, 1);
const cfTimeSystem = new CfTimeSystem('days', sinceDate, 99999);
```

#### `CfDatetime`: CF time points

```javascript
// A CF datetime in the above time system, specified several different ways.
const cfDatetime = new CfDatetime(cfTimeSystem, 720);
const cfDatetime = CfDatetime.fromDatetime(cfTimeSystem, 1952, 1, 1);
const cfDatetime = CfDatetime.fromLooseFormat(cfTimeSystem, '1952/01/01');
console.log(cfDatetime.index); // -> 720
console.log(cfDatetime.toLooseString(true)); // -> 1952/01/01
```

```javascript
// Some possibly useful time points in the above time system.
// Note these are `CfDatetime`s, not CalendarDatetime`s.
const start = cfTimeSystem.firstCfDatetime();
console.log(start.index);  // -> 0

const end = cfTimeSystem.lastCfDatetime();
console.log(end.index);  // -> 99999

const today = cfTimeSystem.todayAsCfDatetime();
console.log(today.index);  // -> some value around (<current year> - 1950) * 360
```
