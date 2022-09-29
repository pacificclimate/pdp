'''This portal serves the version 2 BCCAQ downscaled (4km) data
for all Canada.
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bccaq_version_2'
url_base = '/downscaled_gcms'
title = 'Canadian Downscaled Climate Scenarios - Univariate (CMIP5): CanDCS-U5'


class BCCAQ2EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,\
                dfv.file.run.model.short_name,\
                dfv.file.run.name,\
                dfv.netcdf_variable_name,\
                dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, BCCAQ2EnsembleLister,
                                ['js/canada_ex_map.js',
                                 'js/canada_ex_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
