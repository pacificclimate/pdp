'''This portal serves the CMIP6 data downscaled by BCCAQv2
for all Canada. The UI is similar to the CMIP5 BCCAQv2 data, and
the use the same map component (canada_ex_map.js), but 
different frontend controllers (cmip6_bccaq2_app.js). It also contains
additional headings for the PCIC12 models.
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister
import re


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bccaq2_cmip6'
url_base = '/downscaled_cmip6'
title = 'Canadian Downscaled Climate Scenarios - Univariate (CMIP6): CanDCS-U6'


class CMIP6EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        def format_scenario(scenario, pcic12=False):
            '''takes a scenario of the form "historical,ssp126" and
            formats it to be "Historical, SSP1-2.6" or similar. 
            unmatchable scenario strings are returned unchanged.'''
            parsed = re.match(r"^historical,ssp(\d)(\d)(\d)$", scenario)
            if parsed:
                scenario = "Historical, SSP{}-{}.{}".format(parsed.group(1), 
                                                parsed.group(2),
                                                parsed.group(3))
                if pcic12:
                    scenario += " (PCIC12)"
                return scenario
            else:
                return scenario
        
        pcic_12 = ["BCC-CSM2-MR", "CMCC-ESM2", "EC-Earth3-Veg", "FGOALS-g3",\
	        "INM-CM5-0", "IPSL-CM6A-LR", "MIROC-ES2L", "MPI-ESM1-2-HR",\
        	"MRI-ESM2-0", "NorESM2-LM", "TaiESM1", "UKESM1-0-LL"]
        for dfv in ensemble.data_file_variables:
            if dfv.file.run.model.short_name in pcic_12:
                scenario = format_scenario(dfv.file.run.emission.short_name, pcic12=True)
                yield scenario,\
                    dfv.file.run.model.short_name,\
                    dfv.file.run.name,\
                    dfv.netcdf_variable_name,\
                    dfv.file.unique_id.replace('+', '-')

            # Display all models in general headings
            yield format_scenario(dfv.file.run.emission.short_name),\
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
