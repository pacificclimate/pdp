// Configuration file for JS portion of BC PRISM app.

(function() {
  "use strict";

  // Common to all datasets (variables)
  const datasetTimes = {
    // By dataset year span
    "1970-2000": {
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
    map: {
      // Default dataset shown on startup
      defaults: {
        dataset: "pr_mon_PRISM_historical_19700101-20001231_bc",
        variable: "pr"
      },

      // WMS parameters controlling appearance of map tiles
      // By variable name
      wmsParams: {
        pr: {
          LOGSCALE: true,
          STYLES: "default/occam-inv",
          COLORSCALERANGE: {
            climatology: '200,12500',
            timeseries: '1,2000',
          },
          times: datasetTimes,
        },
        tmax: {
          LOGSCALE: true,
          STYLES: "default/ferret",
          COLORSCALERANGE: {
            _default: '-10,20',
          },
          times: datasetTimes,
        },
        tmin: {
          LOGSCALE: true,
          STYLES: "default/ferret",
          COLORSCALERANGE: {
            _default: '-15,10',
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
