'''Exposes globally defined WSGI apps as module variables
'''
import atexit
from os.path import dirname
from pkg_resources import resource_filename

import static
from beaker.middleware import SessionMiddleware
from werkzeug.wsgi import DispatcherMiddleware

#from pdp import get_config, wrap_auth, clean_session_dir
from pdp import wrap_auth, clean_session_dir

from pdp.error import ErrorMiddleware
from pdp.dispatch import PathDispatcher
from pdp_util.auth import check_authorized_return_email
from ga_wsgi_client import AnalyticsMiddleware

import portals.pcds as pcds
from portals.pcds import portal as pcds_portal
from portals.pcds import data_server as pcds_data_server

import portals.bc_prism as bc_prism
from portals.bc_prism import portal as bc_prism_portal
from portals.bc_prism import data_server as bc_prism_data_server

import portals.hydro_stn as hydro_stn
from portals.hydro_stn import portal as hydro_stn_portal
from portals.hydro_stn import data_server as hydro_stn_data_server

import portals.bcsd_downscale_canada as bcsd_canada
from portals.bcsd_downscale_canada import portal as bcsd_canada_portal
from portals.bcsd_downscale_canada import data_server as bcsd_canada_data_server

import portals.bccaq_extremes as bccaq_extremes
from portals.bccaq_extremes import portal as bccaq_extremes_portal
from portals.bccaq_extremes import data_server as bccaq_extremes_data_server

import portals.vic_gen1 as vic_gen1
from portals.vic_gen1 import portal as vic_gen1_portal
from portals.vic_gen1 import data_server as vic_gen1_data_server

import portals.gridded_observations as gridded_observations
from portals.gridded_observations import portal as gridded_observations_portal
from portals.gridded_observations import data_server as gridded_observations_data_server

#global_config = get_config()
#dsn = global_config['dsn']
#pcds_dsn = global_config['pcds_dsn']
#atexit.register(clean_session_dir, global_config['session_dir'], global_config['clean_session_dir'])


def initialize_frontend(global_config, use_auth=False, use_analytics=False):
    '''Frontend server with all portal pages and required resources
    '''

    docs_app = static.Cling(resource_filename('pdp', 'docs/html'))
    static_app = static.Cling(resource_filename('pdp', 'static'))
    check_auth = wrap_auth(check_authorized_return_email, required=False)

    wsgi_app = PathDispatcher([
        # a bit of a hack for now
        ('^/css/(default|pcic).css$',
         static.Cling(resource_filename('pdp_util', 'data'))),
        ('^/check_auth_app/?$', check_auth),
        ('^/{}/.*$'.format(pcds.url_base), pcds_portal(global_config)),
        ('^/pcds_map/.*$', pcds_portal(global_config)),  # legacy url support
        ('^/{}/.*$'.format(hydro_stn.url_base), hydro_stn_portal(global_config)),
        ('^/{}/.*$'.format(bc_prism.url_base), bc_prism_portal(global_config)),
        ('^/{}/.*$'.format(vic_gen1.url_base), vic_gen1_portal(global_config)),
        ('^/{}/.*$'.format(gridded_observations.url_base),
         gridded_observations_portal(global_config)),
        ('^/{}/.*$'.format(bcsd_canada.url_base),
         bcsd_canada_portal(global_config)),
        ('^/{}/.*$'.format(bccaq_extremes.url_base),
         bccaq_extremes_portal(global_config)),
        ('^/docs/.*$', docs_app),
    ], default=static_app)

    if use_analytics:
        wsgi_app = AnalyticsMiddleware(wsgi_app, global_config['analytics'])
    if use_auth:
        wsgi_app = SessionMiddleware(
            wsgi_app, auto=1, data_dir=global_config['session_dir'])
        atexit.register(
            clean_session_dir, global_config['session_dir'], global_config['clean_session_dir'])
    return ErrorMiddleware(wsgi_app)


def initialize_backend(global_config, use_auth=False, use_analytics=False):
    '''Backend pathdispatcher with all data servers
    '''
    wsgi_app = PathDispatcher([
        ('^/{}/.*$'.format(bc_prism.url_base),
         bc_prism_data_server(global_config, bc_prism.ensemble_name)),
        ('^/{}/.*$'.format(bcsd_canada.url_base),
         bcsd_canada_data_server(global_config, bcsd_canada.ensemble_name)),
        ('^/{}/.*$'.format(vic_gen1.url_base),
         vic_gen1_data_server(global_config, vic_gen1.ensemble_name)),
        ('^/{}/.*$'.format(gridded_observations.url_base),
         gridded_observations_data_server(global_config, gridded_observations.ensemble_name)),
        ('^/{}/.*$'.format(bccaq_extremes.url_base),
         bccaq_extremes_data_server(global_config, bccaq_extremes.ensemble_name)),
        ('^/{}/.*$'.format(hydro_stn.url_base),
         hydro_stn_data_server(global_config)),
        ('^/{}/.*$'.format(pcds.url_base), pcds_data_server(global_config))
    ])
    if use_analytics:
        wsgi_app = AnalyticsMiddleware(wsgi_app, global_config['analytics'])
    if use_auth:
        wsgi_app = SessionMiddleware(
            wsgi_app, auto=1, data_dir=global_config['session_dir'])
        atexit.register(
            clean_session_dir, global_config['session_dir'], global_config['clean_session_dir'])
    return ErrorMiddleware(wsgi_app)


def initialize_dev_server(global_config, use_auth=False, use_analytics=False):
    '''Development server
    '''
    return DispatcherMiddleware(initialize_frontend(global_config, use_auth, use_analytics), {
        '/data': initialize_backend(global_config, use_auth, use_analytics)
    })
