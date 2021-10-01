'''This portal serves the CMIP6 data downscaled by BCCAQv2
for all Canada. The UI is similar to the CMIP5 BCCAQv2 data, and
the use the same map component (canada_ex_map.js), but 
different frontend controllers (cmip6_bccaq2_app.js).
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bccaq2_cmip6'
url_base = '/downscaled_cmip6'
title = 'Statistically Downscaled GCM Scenarios - CMIP6'


class CMIP6EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,\
                dfv.file.run.model.short_name,\
                dfv.file.run.name,\
                dfv.netcdf_variable_name,\
                dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, CMIP6EnsembleLister,
                                 ['js/canada_ex_map.js',
                                 'js/cmip6_bccaq2_app.js'])
 

def mk_backend(config):
    return data_server(config, ensemble_name)
