'''The pdp.portals.bc_prism module configures a raster portal to serve
the 1971-2000 and 1981-2010 climatologies and monthly climate data for
800 meter resolution PRISM dataset for BC
'''

from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister
import re


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bc_prism_with_monthlies'
url_base = '/bc_prism'
title = 'High-Resolution PRISM Data'


class PrismEnsembleLister(EnsembleMemberLister):
    def describe_time_set(self, unique_id):
        monthly = unique_id.find("mon") != -1
        climatology = unique_id.find("Clim") != -1
        date_finder = re.match(r'.*_(\d+)-(\d+).*', unique_id)

        return "{} {} {}-{}".format("Monthly " if monthly else "",
                                    "Climatological Averages " if climatology
                                    else "Timeseries ",
                                    date_finder.group(1)[0:4],
                                    date_finder.group(2)[0:4])

    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield self.describe_time_set(dfv.file.unique_id),\
                dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')




def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, PrismEnsembleLister,
                                ['js/prism_demo_map.js',
                                 'js/prism_demo_controls.js',
                                 'js/prism_demo_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
