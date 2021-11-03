'''This portal serves an ensemble of several CanESM5 runs
downscaled by BCCAQv2 for all Canada. As these are CMIP6
datasets, the presentation is congruent with the rest of the
CMIP6 datasets served by bccaq2_cmip6.py, including using
the same ensemble lister.
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister
from pdp.portals.bccaq2_cmip6 import CMIP6EnsembleLister
import re


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bccaq2_canesm5'
url_base = '/downscaled_canesm5'
title = 'Canadian Downscaled Climate Scenarios - Univariate (CMIP6): CanDCS-U6'

def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, CMIP6EnsembleLister,
                                 ['js/canada_ex_map.js',
                                 'js/canesm5_app.js'])
 

def mk_backend(config):
    return data_server(config, ensemble_name)
