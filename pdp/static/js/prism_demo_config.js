// Configuration file for JS portion of BC PRISM app.

(function() {
  "use strict";

  const prism_demo_config = {
    map: {
      defaults: {
        dataset: "pr_mon_PRISM_historical_19700101-20001231_bc",
        variable: "pr"
      }
    }
  };

  condExport(module, prism_demo_config, 'prism_demo_config');
})();
