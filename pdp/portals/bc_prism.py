'''The pdp.portals.bc_prism module configures a raster portal to serve the 1971-2000, 800 meter resolution PRISM dataset for BC.
'''

from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ('url_base', 'mk_frontend', 'mk_backend')


ensemble_name = 'bc_prism'
url_base = '/bc_prism'
title = 'High-Resolution PRISM Climatology'

class PrismEnsembleLister(EnsembleMemberLister):
    def parse_date_range(self, unique_id):
        return '-'.join([x[:4] for x in unique_id.split('_')[-1].split('-')])

    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield self.parse_date_range(dfv.file.unique_id), dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, PrismEnsembleLister,
                                ['js/prism_demo_map.js',
                                 'js/prism_demo_controls.js',
                                 'js/prism_demo_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
