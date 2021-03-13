'''This portal serves the version 1 BCCAQ downscaled (10km) data
and BCSD data for all of Canada. This data has been superceded by
the BCCAQ (4km) data, served by bccaq_downscale.py.
The two BCCAQ datasets are similarly structured and share a front end,
canada_ex_app.js.
'''
from pdp.portals.raster import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'downscaled_gcms_archive'
url_base = '/downscaled_gcms_archive'
title = 'Statistically Downscaled GCM Scenarios - Archived Methods'


class DownscaledEnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,\
                dfv.file.run.model.short_name.replace('BCCAQ', 'BCCAQv1'),\
                dfv.netcdf_variable_name,\
                dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, DownscaledEnsembleLister,
                                ['js/canada_ex_map.js',
                                 'js/canada_ex_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
