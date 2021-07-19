// Configuration file BC PRISM client app.
//
// IMPORTANT: This file is for demonstrating how the base configuration file
// at `pdp/static/js/prism_demo_config.js` can be overridden at deployment time
// by mounting a different file (this one). PLEASE ENSURE THAT THIS FILE AND
// THE BASE CONFIG FILE ARE KEPT UP TO DATE.
//
// This file is in the standard form for a client app component, and exports its
// content to the global object using `condExport`.
//
// This file contains values processed by `prism_demo_app.js` and its
// subsidiaries.
//
// This file should contain a minimum of computation. Since it is a JS file,
// it can perform arbitrary computation, but such work is, generally speaking,
// the job of the client app proper, not of the configuration file. The idea is
// to make this file's contents as declarative and JSON-like as possible.


(function() {
  "use strict";
  // General notes: The configuration object exported is a nested dictionary.
  // In many cases the values for several or all of the expected keys in any
  // given sub-dictionary are the same. In this case, and to cover any
  // unexpected cases (keys), a default or fallback value can be provided with
  // key `_default`.

  // Time values for layers shown. A two-level dictionary, with top-level
  // keys indicating the time span of the datasets it applies to, and
  // second-level keys indicating the averaging period of the dataset.
  // Common to all datasets (variables)
  const datasetTimes = {
    // By dataset year span; key is formed from start and end year, separated
    // by a dash.
    "1970-2000": {
      // By averaging period. Expected keys at the moment are "mon" and "yr".
      mon: "1985-06-30",
      yr: "1985-06-30",
    },
    "1981-2010": {
      mon: "1996-06-15",
      yr: "1996-06-30",
    },
    "1950-2007": {
      mon: "1980-04-30"
    },
    _default: {
      mon: "1996-06-15",
      yr: "1996-06-30",
    },
  };

  const prism_demo_config = {
    // Map configuration.
    map: {
      // Default dataset shown on startup
      defaults: {
        dataset: "pr_mon_PRISM_historical_19700101-20001231_bc",
        variable: "pr"
      },

      // WMS parameters controlling appearance of map tiles
      wmsParams: {
        // By variable name
        pr: {
          // Directly specified ncWMS request parameters
          LOGSCALE: true,
          STYLES: "default/occam-inv",
          COLORSCALERANGE: {
            // By dataset type
            climatology: {
              // By averaging period
              mon: '1,2000',
              yr: '200,12500',
            },
            timeseries: {
              mon: '1,2000',
            },
          },
          // Values for selecting time value to display from a dataset.
          times: datasetTimes,
        },

        tmax: {
          LOGSCALE: false,
          STYLES: "default/ferret",
          COLORSCALERANGE: {
            _default: {
              _default: '-10,20'
            },
          },
          times: datasetTimes,
        },

        tmin: {
          LOGSCALE: false,
          STYLES: "default/ferret",
          COLORSCALERANGE: {
            _default: {
              _default: '-15,10'
            },
          },
          times: datasetTimes,
        },
      }
    }
  };

  // Easy way to set default map.wmsParams
  prism_demo_config.map.wmsParams._default =
    prism_demo_config.map.wmsParams.tmax;

  condExport(module, prism_demo_config, 'prism_demo_config');
})();
