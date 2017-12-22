'''Exposes globally defined WSGI apps as module variables
'''
import atexit
from pkg_resources import resource_filename

import static
from beaker.middleware import SessionMiddleware
from werkzeug.wsgi import DispatcherMiddleware

from pdp.error import ErrorMiddleware
from pdp.dispatch import PathDispatcher
from ga_wsgi_client import AnalyticsMiddleware

import portals.pcds as pcds
from portals.pcds import portal as pcds_portal
from portals.pcds import data_server as pcds_data_server

import portals.bc_prism as bc_prism
from portals.bc_prism import portal as bc_prism_portal

import portals.hydro_stn as hydro_stn
from portals.hydro_stn import portal as hydro_stn_portal
from portals.hydro_stn import data_server as hydro_stn_data_server

import portals.bcsd_downscale_canada as bcsd_canada
from portals.bcsd_downscale_canada import portal as bcsd_canada_portal

import portals.bccaq_extremes as bccaq_extremes
from portals.bccaq_extremes import portal as bccaq_extremes_portal

import portals.vic_gen1 as vic_gen1
from portals.vic_gen1 import portal as vic_gen1_portal

import portals.gridded_observations as gridded_observations
from portals.gridded_observations import portal as gridded_observations_portal

from portals import data_server


def initialize_frontend(global_config, use_analytics=False):
    '''Frontend server with all portal pages and required resources
    '''

    docs_app = static.Cling(resource_filename('pdp', 'docs/html'))
    static_app = static.Cling(resource_filename('pdp', 'static'))

    wsgi_app = PathDispatcher([
        ('^/css/(default|pcic).css$',
         static.Cling(resource_filename('pdp_util', 'data'))), # a bit of a hack for now
        ('^{}/.*$'.format(pcds.url_base), pcds_portal(global_config)),
        ('^/pcds_map/.*$', pcds_portal(global_config)),  # legacy url support
        ('^{}/.*$'.format(hydro_stn.url_base), hydro_stn_portal(global_config)),
        ('^{}/.*$'.format(bc_prism.url_base), bc_prism_portal(global_config)),
        ('^{}/.*$'.format(vic_gen1.url_base), vic_gen1_portal(global_config)),
        ('^{}/.*$'.format(gridded_observations.url_base), gridded_observations_portal(global_config)),
        ('^{}/.*$'.format(bcsd_canada.url_base), bcsd_canada_portal(global_config)),
        ('^{}/.*$'.format(bccaq_extremes.url_base), bccaq_extremes_portal(global_config)),
        ('^/docs/.*$', docs_app),
    ], default=static_app)

    if use_analytics:
        wsgi_app = AnalyticsMiddleware(wsgi_app, global_config['analytics'])
    return ErrorMiddleware(wsgi_app)


def initialize_backend(global_config, use_analytics=False):
    '''Backend pathdispatcher with all data servers
    '''
    apps = (bc_prism, bcsd_canada, vic_gen1, gridded_observations,
            bccaq_extremes)
    mounts = {
        app.url_base: data_server(global_config, app.ensemble_name)
        for app in apps
    }
    mounts.update({
        hydro_stn.url_base: hydro_stn_data_server(global_config),
        pcds.url_base: pcds_data_server(global_config)
    })

    static_app = static.Cling(resource_filename('pdp', 'static'))
    wsgi_app = DispatcherMiddleware(static_app, mounts)

    if use_analytics:
        wsgi_app = AnalyticsMiddleware(wsgi_app, global_config['analytics'])
    return ErrorMiddleware(wsgi_app)


def initialize_dev_server(global_config, use_analytics=False):
  '''Development server
  '''
  return DispatcherMiddleware(initialize_frontend(global_config, use_analytics), {
    '/data': initialize_backend(global_config, use_analytics)
  })
