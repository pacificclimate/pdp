'''The pdp.portals.vic_gen1 module configures a raster portal which
serves the first generation of output from the VIC Hydrologic
Model. The spatial domain is specific watersheds within BC and the
model was run using CMIP3 forcings.
'''

from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'vic_gen1'
url_base = '/hydro_model_out'
title = 'Gridded Hydrologic Model Output'


class VicGen1EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,\
                dfv.file.run.model.short_name, dfv.netcdf_variable_name,\
                dfv.file.unique_id.replace('+', '-')



def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, VicGen1EnsembleLister,
                                ['js/vic_gen1_map.js',
                                 'js/vic_gen1_controls.js',
                                 'js/vic_gen1_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
