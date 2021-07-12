## Table of Contents
- [1.0 Dependencies](#10-dependencies)
  - [1.1 Python](#11-python)
  - [1.2 Node.js (test framework only)](#12-nodejs-test-framework-only)
- [2.0 Installation](#20-installation)
  - [2.1 Development](#21-development)
    - [2.1.1 Server](#211-server)
    - [2.1.2 JS tests](#212-js-tests)
  - [2.2 Production](#22-production)
- [3.0 Configuration](#30-configuration)
  - [3.1 Environment variables](#31-environment-variables)
    - [3.1.1 Config Items](#311-config-items)
  - [3.2 JavaScript configuration code](#32-javascript-configuration-code)
- [4.0 Tests](#40-tests)
  - [4.1 Python (Docker local (py)test environment)](#41-python-docker-local-pytest-environment)
    - [4.1.1 TL;DR: Brief instructions](#411-tldr-brief-instructions)
    - [4.1.2 What](#412-what)
    - [4.1.3 Why](#413-why)
    - [4.1.4 Mechanism](#414-mechanism)
    - [4.1.5 Instructions](#415-instructions)
    - [4.1.6 Notes and caveats](#416-notes-and-caveats)
  - [4.2 Node.js (tests of JS code)](#42-nodejs-tests-of-js-code)
- [5.0 Deploying](#50-deploying)
  - [5.1 Development](#51-development)
  - [5.2 Production](#52-production)
    - [5.2.1 Gunicorn](#521-gunicorn)
    - [5.2.2 Supervisord](#522-supervisord)
- [6.0 Module `calendars`](#60-module-calendars)
  - [6.1 Introductory notes](#61-introductory-notes)
  - [6.2 Calendars](#62-calendars)
  - [6.3 Datetimes (in specific calendars)](#63-datetimes-in-specific-calendars)
  - [6.4 CF time systems](#64-cf-time-systems)
  - [6.5 Usage](#65-usage)
    - [6.5.1 `CalendarDatetime`: Datetimes in various calendars](#651-calendardatetime-datetimes-in-various-calendars)
    - [6.5.2 `CfTimeSystem`: CF time systems](#652-cftimesystem-cf-time-systems)
    - [6.5.3 `CfDatetime`: CF time points](#653-cfdatetime-cf-time-points)

# 1.0 Dependencies

## 1.1 Python

The server for the PDP frontend is written in Python.
It packages up, minifies, and serves the various "static" JS files and other resources
(e.g., CSS) from which the frontend is built.

The pdp requires that pip and tox be installed.

```bash
sudo apt-get install python-pip python-dev build-essential
sudo pip install tox ## or pip install tox --user
```

Some of the required python libraries have system-level dependencies.

```bash
sudo apt-get install libhdf5-dev libnetcdf-dev libgdal-dev
```

And GDAL doesn't properly source it's own lib paths when installing the python package:

```bash
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
```

## 1.2 Node.js (test framework only)

The test framework for the PDP frontend runs in [Node.js](https://nodejs.org/en/).

There are several different valid ways to install Node.js on a Ubuntu system.

We reccomend using [nvm](https://github.com/creationix/nvm) to manage your node/npm install.
It is a little more laborious (not a lot), and provides a lot more flexibility than the
simpler installation methods, which you can look up by searching "ubuntu install nodejs".

# 2.0 Installation

## 2.1 Development

### 2.1.1 Server

With the prerequisites, creating a development environment should be as simple as:

```bash
git clone https://github.com/pacificclimate/pdp
cd pdp
tox -e devenv
```

It could take 5-30 minutes since tox will not use system packages and needs to build any package which requires it.

### 2.1.2 JS tests

With Node.js installed (see above), you can install all the test framework dependencies
as follows:

```bash
npm install
```

Notes:

* The JS tests are written using test framework called [Jest](https://jestjs.io/)
which provides many useful features, including a simulation of the DOM in JS
that enables tests of code that manipulate the DOM.

* DOM simulation is provided by a package called `jsdom`, which ships with Jest.
However, the version that currently ships lacks a couple of features that we need,
so we install `jest-environment-jsdom-fourteen`, which upgrades the version of
`jsdom`. This may become unnecessary with later versions of Jest.

* Since little of the JS code is written with unit testing in mind,
we exploit `jsdom` heavily in the tests. Essentially, these tests use
jQuery queries to find out what is going on in the DOM as the app does its thing.


## 2.2 Production

It is best practice to maintain a consistent virtual environment for production.

```bash
git clone https://github.com/pacificclimate/pdp
cd pdp
virtualenv pyenv
```

The pdp will run in any WSGI container. This guide uses gunicorn.

```bash
pyenv/bin/pip install -i https://pypi.pacificclimate.org/simple/ -r requirements.txt -r data_format_requirements.txt -r test_requirements.txt -r deploy_requirements.txt
```

Install and build the docs. Building the docs requires the package to be installed, then installed again after the docs are built.

```bash
pyenv/bin/python setup.py install
pyenv/bin/python setup.py build_sphinx
pyenv/bin/python setup.py install
```

# 3.0 Configuration

Configuration of the PDP is accomplished through two mechanisms:
- For server-side configuration and very simple client-side
  configuration (such as the URL of the ncWMS service),
  a set of environment variables.
- For more complex client-side app configuration,
  configuration code in JavaScript files, at most one file per portal.

## 3.1 Environment variables

A sample environment file is stored in `pdp/config.env`.
This environment file can be sourced in before you run the pdp, included in a
Docker deployment or used in any other flexible way.

```bash
source pdp/config.env
export $(grep -v '^#' pdp/config.env | cut -d= -f1)
```

### 3.1.1 Config Items

| Name | Description | 
| ---- | ----------- |
| `app_root` | Root location where data portal will be exposed. This location will need to be proxied to whatever port the server will be running on. |
| `data_root` | Root location of backend data server. Probably `<app_root>/data`. If you are running in production, this location will need to be proxied to whatever port the data server will be running on. When running a development server, this is redirected internally. |
| `dsn` | Raster metadata database url of the form `dialect[+driver]://username:password@host:port/database`. Password must either be supplied or available in the user's `~/.pgpass` file. |
| `pcds_dsn` | PCDS database URL of the form `dialect[+driver]://username:password@host:port/database`. Password must either be supplied or available in the user's `~/.pgpass` file. |
| `js_min` | Determine's use of javascript bundling/minification. |
| `geoserver_url` | PCDS Geoserver URL |
| `ncwms_url` | Raster portal ncWMS URL |
| `tilecache_url` | Tileserver URLs (space separated list) for base maps |
| `use_analytics` | Enable or disable Google Analytics reporting |
| `analytics` | Google Analytics ID |

## 3.2 JavaScript configuration code

Some portals are configured by hard-coded values in the client
app JavaScript.
Other portals are configured a separate JS configuration file that exports
a configuration object processed by the client app.

A separate configuration file can easily be superseded by mounting a volume
to its file path that contains different configuration content. In the Docker
container, such files have internal (target) file paths of the form
`/root/pdp/pdp/static/js/<portal>_config.js`; for example,
`/root/pdp/pdp/static/js/prism_demo_config.js`.
Note the doubled `pdp` subdirectories.

Developers are **strongly encouraged** to keep the JS configuration files in
this repo up to date with the most recently deployed configurations. When
a configuration is changed for deployment, the repo copy of the configuration
file should also be changed appropriately. A new release need not be made
right away (that is of course the point of separate configuration),
but eventually updates will make their way into releases, and we will also
have a typical or standard configurations that are easily accessible.

At present, the following JS portal configuration files exist:
- PRISM: `pdp/static/js/prism_demo_config.js`

# 4.0 Tests

## 4.1 Python (Docker local (py)test environment)

### 4.1.1 TL;DR: Brief instructions

For greater detail, see section Instructions below.

1. Pull the image 

   `docker pull pcic/pdp-local-pytest:<tag>`
   
   where `<tag>` either `latest` or your branch name, the latter only if
   you modified the Dockerfile in `local-pytest`. You may only rarely need
   to pull a new copy of the image.
   
1. Run the container: `./docker/local-pytest/up-backend.sh`. The container will
   start, install your local version of the project, and give you a bash
   command line prompt.
    
1. Run your tests, etc.: In the running container, enter commands at the prompt,
   e.g., `py.test ...`.
   
1. Stop the container: When you no longer wish the container to be running,
   enter `ctrl+D` or `exit` at the container command line prompt. 
   
   If you detached from the image, you can enter 
   `./docker/local-pytest/down-backend.sh` to stop and remove the container.

### 4.1.2 What

The files in this directory allow you to build and run a test environment
for this package equivalent to that in the GitHub Actions CI. Within this 
environment you can run part or all of the test suite, or do other dev/debug 
activities.

### 4.1.3 Why

1. We are currently running CI tests in an antiquated environment (including
Python 2.7) which 
is difficult if not impossible to reproduce on an up-to-date dev machine. 
Plus it messes up your machine. Docker containers to the rescue.

1. We could just let the CI do the work, but it can take from 2 to 5 minutes
to run a single test ... most of that consumed by setting up the docker 
container for the test run.

1. So let's just build that environment once, run it interactively, 
run our tests from inside there, and wow zippy. Debugging now feasible.

### 4.1.4 Mechanism

1. The image is built with all the contents necessary to install and run the
package and its tests. 

1. But since we want to run our own, local test code, we can't install this package 
from a repo. Instead we install from our local codebase when the container is 
started.

1. To facilitate this, we set up a working diretory (WORKDIR) in the image
called `/codebase`. 

1. When we run the image, we must mount our local codebase to `/codebase`.
(See Run image).

1. When the container starts (image runs), the script 
`entrypoint.sh` installs the local version of this package 
(in development mode `-e`). It also sets up 
and `su`s a non-root user, `test`, because PostgreSQL refuses -- sensibly --
to run as the root user, which is what we are up to this point.

1. Because we have mounted our codebase to the
container, when we make changes to it (outside the container), those changes
are available inside the container, and vice-versa. Therefore we can use all
our local tools outside the container as normal (which is a shedload easier
than trying to install your IDE inside the container :) ).

1. The vice-versa has a downside, which is that runs of the tests leave
behind a set "orphaned" pytest caches which will cause the next
run of the image to fail if they are not cleaned up first with `py3clean`.
We don't, however mount the codebase read-only because we might want 
some effects of the test runs to be written to our external filesystem 
(e.g., redirected output).

### 4.1.5 Instructions

***Pull image***

The GitHub Action docker-publish automatically builds the image.
Pull it from Dockerhub:

```
docker pull pcic/pdp-local-pytest:<tag>
```

If you are working on a branch, then `<tag>` will be your branch name.

***Run image (container)***

1. Update `docker/local-pytest/up-backend.sh` with the <tag> if necessary.

2. Run it from the project root directory.

    ```
    py3clean .
    ./docker/local-pytest/up-backend.sh
    ```

When the container starts, it installs the local codebase as described above.
After that, you are in interactive mode, in a bash shell, so you can issue 
commands, such as `py.test ....` as normal.

Leave the container running for as long as you want. You can do multiple
rounds of modification and testing using a single container, without
restarting (which was the justification for creating it).

***Build image (manual)***

Since this image is built automatically by the GitHub Action docker-publish,
you should not need to do this. However, just in case:

From the _project root directory_ (important Docker context location):

```
docker build -t pcic/pdp-local-pytest -f docker/local-pytest/Dockerfile .
```

### 4.1.6 Notes and caveats

1. Writing to a mounted volume from inside a docker container involves some
tricky permissions logic that I don't fully understand yet. Known:
    - If the user inside the container has the same user id 
    (numeric, e.g., 1000) as the owner of the mounted file or directory outside 
    the container, then it is possible to write to the mounted volume 
    (e.g., to redirect output from a test run to a file). 
    - If the user id's differ, a permissions error is raised and the write 
    fails.
    - Default user id (of the first user) on a Linux system is 1000.
    My own user id (rglover) is 1000. Hence the setting of user id 1000
    in `entrypoint.sh`. If your user id is not 1000, you will need to change
    this if you wish to write content from inside the container.
    - This is a hack and should be cleaned up so it works
    generally. That will require some research into Docker's mechanisms for
    mapping user ids between a container and its run environment, not for the
    fainthearted. 

1. As noted above, running tests in the test container in read/write mode 
leaves problematic pycache junk behind in the host filesystem. 
This can be cleaned up by running `py3clean`.


## 4.2 Node.js (tests of JS code)

All JS tests are found in the directory `pdp/static/js/__test__`.

No configuration is required to run the Node.js tests. Simply:

```bash
npm run test
```

# 5.0 Deploying

## 5.1 Development

Provided you installed everything with `tox`, you should be able to run a development server as follows:

First set up the environment variables that do not default to usable values.
Obtain the user ID's and passwords necessary for the two databases from PCIC IT.
We typically use port 8000 but any port will do.

```bash
export DSN=postgresql://<USER>:<PASSWORD>@db3.pcic.uvic.ca/pcic_meta
export DATA_ROOT=http://127.0.0.1:<PORT>/data
export PCDS_DSN=postgresql://<USER>:<PASSWORD>@db3.pcic.uvic.ca/crmp
export APP_ROOT=http://127.0.0.1:<PORT>
```

Run the server:

```bash
devenv/bin/python scripts/rast_serve.py -p <PORT> [-t]
```

## 5.2 Production

A production install should be run in a production ready WSGI container with proper process monitoring. We use [gunicorn](http://gunicorn.org/) as the WSGI container, [Supervisord](http://supervisord.org/) for process monitoring, and [Apache](http://httpd.apache.org/) as a reverse proxy.

In production, the frontend and backend are ran in seperate WSGI containers. This is because the front end serves short, non-blocking requests, whereas the back end serves fewer long, process blocking requests.

### 5.2.1 Gunicorn

Running in gunicorn can be tested with a command similar to the following:

```bash
pyenv/bin/gunicorn -b 0.0.0.0:<port1> pdp.wsgi:frontend
pyenv/bin/gunicorn -b 0.0.0.0:<port2> pdp.wsgi:backend
```

### 5.2.2 Supervisord

*Note: this is only an **example** process monitoring setup. Details can and will be different depending on your particular deployment stragety*

Set up the Supervisord config file using
```bash
pyenv/bin/echo_supervisord_conf > /install/location/supervisord.conf
```

In order to run Supervisord, the config file must have a `[supervisord]` section. Here's a sample section:

```ini
[supervisord]
logfile=/install/location/etc/<supervisord_logfile>      ; (main log file;default $CWD/supervisord.log)
loglevel=info     ; (log level;default info; others: debug,warn,trace)
nodaemon=true     ; (start in foreground if true; useful for debugging)
```

Supervisorctl is a command line utility that lets you see the status and output of processes and start, stop and restart them. The following will set up supervisorctl using a unix socket file, but it is also possible to monitor processes using a web interface if you wish to do so.

```ini
[unix_http_server]
file = /tmp/supervisord.sock

[supervisorctl]
serverurl = unix:///tmp/supervisord.sock

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
```

Front end config

```ini
[program:pdp_frontend-v.v.v]
command=/install/location/pyenv/bin/gunicorn -b 0.0.0.0:<port> --access-logfile=<access_logfile> --error-logfile=<error_logfile> pdp.wsgi:frontend
directory=/install/location/
user=www-data
environment=OPTION0="",OPTION2=""...
autostart=true
autorestart=true
redirect_stderr=True
killasgroup=True
```

Back end config

```ini
[program:pdp_backend-v.v.v]
command=/install/location/pyenv/bin/gunicorn -b 0.0.0.0:<port> --workers 10 --worker-class gevent -t 3600 --access-logfile=<access_logfile> --error-logfile=<error_logfile> pdp.wsgi:backend
directory=/install/location/
user=www-data
environment=OPTION0="",OPTION2=""...
autostart=true
autorestart=true
redirect_stderr=True
killasgroup=True
```

To make starting/stop easier, add a group to `supervisord.conf`

```ini
[group:v.v.v]
programs=pdp_frontend-v.v.v,pdp_backend-v.v.v
```

Once the config file has been set up, start the processes with the following command:

```bash
pyenv/bin/supervisord -c path/to/supervisord.conf
```

After invoking Supervisord, use supervisorctl to monitor and update the running processes

```bash
pyenv/bin/supervisorctl
```

When upgrading, it's easiest to simply copy the existing config and update the paths/version number.

**IMPORTANT**: When adding a new version, make sure to set the old version `autostart` and `autorestart` to false.

Using `supervisorctl`, you should then be able to `reread` the new config, `update` the old version config (so it stops, picks up new autostart/autorestart=false), and `update` the new version.

If there are any errors, they can be found in the `supervisord_logfile`. Errors starting gunicorn can be found in the `error_logfile`.

# 6.0 Module `calendars`

## 6.1 Introductory notes

- In this section, we use the term `class`, a concept which strictly speaking JS doesn't support.
However, we use JS patterns that emulate class-based code fairly closely; in particular, that emulate
many of the features of the ES6 `class` syntactic sugar. This is currently done via the utilities provided
in module `classes`.

- Objects that can be instantiated with these constructors are mutable, but few if any mutation methods are
provided. This is because mutation makes code hard to reason about
(it removes [referential transparency](https://nrinaudo.github.io/scala-best-practices/definitions/referential_transparency.html)).
Instead of mutation, prefer to create a new object containing the new value, rather than mutating an old object.

## 6.2 Calendars

PDP datasets use a variety of different, mutually incompatible calendar systems. These systems include:

- Standard or Gregorian calendar.
- 365-day calendar: Like the Gregorian calendar, but without leap years.
- 360-day calendar: Every month in every year has exactly 30 days.

JavaScript directly supports only the Gregorian calendar, via the `Date` object. It is not possible (whilst retaining
developer sanity, or code maintainability) to handle non-Gregorian calendars using a Gregorian calendar.
Previous code that attempted to do so contained errors traceable to the incompatibility of different calendar systems.

To address this situation, we have defined a module `calendars` containing the following items:

- Class `Calendar`, which represents the general notion of a calendar,
and subclasses `GregorianCalendar`, `Fixed365DayCalendar`, `Fixed360DayCalendar`, which represent specific,
different calendar types.
   - Rightly or wrongly, `Calendar`s are used as instances (so far we have only discussed things that could be
   equally well be supplied by a fixed object, or singleton).
   - Each `Calendar` instance has an epoch year, which defines the epoch or origin date for computations the calendar
   can perform. Dates before Jan 1 of the epoch year are not valid. This is stupid, a result of lazy implementation,
   but it is true for now. Default epoch year is 1800.
   - `Calendar` has abstract methods `isLeapYear()`,  `daysPerMonth()`, `daysPerYear()` that concrete subclasses
   define in order to specify different particular calendars.
   - `Calendar` provides a number of service methods for validating datetimes and for computing essential
   quantities, such as the number of milliseconds since epoch. These are fundamental to datetime computations within
   any given calendar system.

Most users of this module will not need to define their own `Calendar` subclasses, nor their own instances of
those subclasses (specifying `epochYear`), since the provided standard instances are designed to meet known use cases
in PDP. However, the option is there for unforeseen applications.

- The standard (and default) `epochYear` is 1800.
- The `calendars` module offers pre-instantiated standard calendars of each type, indexed by the standard CF identifiers
for each type:
   - `calendars['standard']`,`calendars['gregorian']`
   - `calendars['365_day']`, `calendars['noleap']`
   - `calendars['360_day']`

## 6.3 Datetimes (in specific calendars)

The following classes exploit `Calendar` objects to represent datetimes in specific calendrical systems.

- Class `SimpleDatetime` that bundles together the `year`, `month`, `day`, etc. components of a datetime,
_without reference to any specific calendar_.

- Class `CalendarDatetime` composes a `Calendar` with a `SimpleDatetime`, to represent a datetime in a particular
calendar. (Note: We [prefer composition over inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance).)
   - At the moment, it offers only conversion methods (e.g., `toISOString()`) and factories (e.g., `fromMsSinceEpoch()`).
   - This would be the class in which to place calendar-aware datetime arithmetic methods (e.g., `addDays()`),
   but we have no use for this in present applications so the class lacks such methods.

## 6.4 CF time systems

In CF standards compliant datasets, datetimes are represented by index values (values of the time dimension)
in a time system defined by units, start datetime, and calendar.

- Units are fixed intervals of time labelled by terms such as 'day', 'hour', 'minute'.
- A start datetime is a specification of year, month, day, etc., in a specified calendar system.
- The calendar is specified an identifier chosen from a fixed CF vocabulary that includes 'standard', 'gregorian',
'365_day', 'noleap', and '360_day', with the obvious meanings.
- A time index _t_ specifies a time point defined as _t_ time units after the start datetime, in the specified calendar.

The following classes represent time systems and datetimes within such a system:

- Class `CfTimeSystem`, which represents a CF time system, as above.
  - Constructed with arguments `units` and `startDate`; the latter is a `CalendarDatetime`, which carries both
  the calendar and the datetime. This is one of the places where method signature is hard to remember, and
  could perhaps be improved.

- Class `CfDatetime`, which [composes](https://en.wikipedia.org/wiki/Composition_over_inheritance) a
`CfTimeSystem` and a real-valued index to represent a specific time within a CF time system.
   - Like `CalendarDatetime` (to which it is a parallel), `CfDatetime` offers only conversion methods
   (e.g., `toISOString()`, `toCalendarDatetime`) and factories (e.g., `fromLooseFormat()`).
   - Like `CalendarDatetime`, this is the class in which time arithmetic methods would be placed, but none are
   currently needed, so none exist.

## 6.5 Usage

Playing at classes is all very well, till somebody loses their mind. How is this intended to be used?

Here are some code snippets that show the application of these objects. Some make it obvious that it
would be nicer to have (a) more consistent and/or flexible method signatures, and (b) more helper methods.

### 6.5.1 `CalendarDatetime`: Datetimes in various calendars

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

### 6.5.2 `CfTimeSystem`: CF time systems

```javascript
// A CF time system: days since 1950-01-01 in 360-day calendar; maximum time index 99999.
const sinceDate = new CalendarDatetime(calendars['360_day'], 1950, 1, 1);
const cfTimeSystem = new CfTimeSystem('days', sinceDate, 99999);
```

### 6.5.3 `CfDatetime`: CF time points

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
