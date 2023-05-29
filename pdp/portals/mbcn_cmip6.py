'''This portal serves the CMIP6 data downscaled by MBCn
for all Canada. The UI is similar to the CMIP6 BCCAQv2 data, and
the use the same map component (canada_ex_map.js), but 
different frontend controllers (cmip6_mbcn_app.js).
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister
import re


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'mbcn_cmip6'
url_base = '/downscaled_cmip6_multi'
title = 'Canadian Downscaled Climate Scenarios - Multivariate (CMIP6): CanDCS-M6'


class CMIP6EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        def format_scenario(scenario):
            '''takes a scenario of the form "historical,ssp126" and
            formats it to be "Historical, SSP1-2.6" or similar. 
            unmatchable scenario strings are returned unchanged.'''
            parsed = re.match(r"^historical,ssp(\d)(\d)(\d)$", scenario)
            if parsed:
                return "Historical, SSP{}-{}.{}".format(parsed.group(1), 
                                                parsed.group(2),
                                                parsed.group(3))
            else:
                return scenario
        
        for dfv in ensemble.data_file_variables:
            yield format_scenario(dfv.file.run.emission.short_name),\
                dfv.file.run.model.short_name,\
                dfv.file.run.name,\
                dfv.netcdf_variable_name,\
                dfv.file.unique_id.replace('+', '-')


    


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, CMIP6EnsembleLister,
                                 ['js/canada_ex_map.js',
                                 'js/cmip6_mbcn_app.js'])
 

def mk_backend(config):
    return data_server(config, ensemble_name)
