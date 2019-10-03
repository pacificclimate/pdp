'''The pdp.portals.vic_gen2 module configures a raster portal which
serves output from the VIC Hydrologic Model with CMIP5 input. The spatial
domain is specific watersheds within BC and the model was run using CMIP5
forcings tuned with the PNWNAMet forcings.

It shares many characteristics with the CMIP3 VIC data served by the
pdp.portals.vic_gen1 module. The two datasets are displayed by the same
portal code, vic_app.js, and map code, vic_map.js.
'''

from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'vicgl_cmip5'
url_base = '/hydro_model_out'
title = 'Gridded Hydrologic Model Output'


class VicGen2EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,\
                dfv.file.run.model.short_name, dfv.netcdf_variable_name,\
                dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, VicGen2EnsembleLister,
                                ['js/vic_map.js',
                                 'js/vic_controls.js',
                                 'js/vic_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
