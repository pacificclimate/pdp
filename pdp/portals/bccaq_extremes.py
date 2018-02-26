'''The pdp.portals.bccaq_extremes module configures a raster portal to serve ClimDEX data computed on the Canada-wide BCCAQ downscaled dataset.
'''

from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bccaq_extremes'
url_base = '/downscaled_gcm_extremes'
title = 'Statistically Downscaled GCM Scenarios: Extremes'


class ClimdexEnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            ## FIXME
            yield dfv.file.run.emission.short_name, dfv.file.run.model.short_name, "annual" if "_yr_" in dfv.file.unique_id else "monthly", dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(
        config, ensemble_name, url_base,
        title, ClimdexEnsembleLister,
        ['js/d3.v3.min.js',
         'js/bccaq_extremes_map.js',
         'js/bccaq_extremes_controls.js',
         'js/bccaq_extremes_app.js'],
        ['css/plot.css'])


def mk_backend(config):
    return data_server(config, ensemble_name)
