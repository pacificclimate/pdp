'''The pdp.portals.bcsd_downscale_canada module configures a raster
portal to serve BCSD and BCCAQ downscaled (10km) data over all of
Canada.
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bcsd_downscale_canada'
url_base = '/downscaled_gcms'
title = 'Statistically Downscaled GCM Scenarios'


class DownscaledEnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,
            dfv.file.run.model.short_name, dfv.netcdf_variable_name,
            dfv.file.unique_id.replace('+', '-')



def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, DownscaledEnsembleLister,
                                ['js/canada_ex_map.js',
                                 'js/canada_ex_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)

