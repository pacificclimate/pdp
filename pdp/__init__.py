'''The pdp package ties together all of the aspects of the PCIC Data Portal (pdp).
   The base pdp module configures the application, sets up a URL hierarchy (a PathDispatcher instance),
   instantiates all of the responder applications and binds them to various PathDispatchers.
'''

import os
from os.path import dirname
import atexit

from pkg_resources import resource_filename, resource_stream, get_distribution
from tempfile import mkdtemp
from shutil import rmtree
import yaml

import static
from beaker.middleware import SessionMiddleware

from pdp_util.auth import PcicOidMiddleware, check_authorized_return_email
from ga_wsgi_client import AnalyticsMiddleware
from pdp.error import ErrorMiddleware
from pdp.dispatch import PathDispatcher
from pdp.minify import wrap_mini
from pdp.portals import updateConfig

def get_config():
    config = yaml.load(resource_stream('pdp', 'config.yaml'))
    global_config = {
        'css_files': [
            'css/jquery-ui-1.10.2.custom.css',
            'css/reset.css',
            'css/main.css',
            'css/map.css',
            'css/header.css',
            'css/footer.css',
            'css/login.css',
            'css/controls.css',
            'css/menu.css'],
        'js_files': [
            'js/ie8.js', # must be included before OL
            'js/jquery-1.10.2.js',
            'js/jquery-ui-1.10.2.custom.js',
            'js/zebra.js',
            'js/OL/OpenLayers-2.13.1.js',
            'js/proj4js-compressed.js',
            'js/multiaccordion.js'] +
            wrap_mini(['js/pdp_dom_library.js',
            'js/pdp_controls.js',
            'js/pdp_download.js',
            'js/pdp_filters.js',
            'js/pdp_map.js',
            'js/pdp_auth.js',
            'js/pdp_raster_map.js',
            'js/pdp_vector_map.js'
            ], debug=(not config['js_min'])),
        'templates': resource_filename('pdp', 'templates'),
        'version': get_distribution('pdp').version
        }

    config = updateConfig(global_config, config)
    if config['session_dir'] == 'default':
        config['session_dir'] = resource_filename('pdp', 'pdp_session_dir')
    return config

def clean_session_dir(session_dir, should_I):
    if should_I:
        print('Removing session directory {}'.format(session_dir))
        rmtree(session_dir)


# auth wrappers
def wrap_auth(app, required=True):
    '''This function wraps a WSGI application with the PcicOidMiddleware for session management and optional authentication
    '''
    config = get_config()
    app = PcicOidMiddleware(app,
                            templates=resource_filename('pdp', 'templates'),
                            root=config['app_root'],
                            auth_required=required)
    return app


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

def dev_server():
    global_config = get_config()
    dsn = global_config['dsn']
    pcds_dsn = global_config['pcds_dsn']
    atexit.register(clean_session_dir, global_config['session_dir'], global_config['clean_session_dir'])

    check_auth = wrap_auth(check_authorized_return_email, required=False)
    docs_app = static.Cling(dirname(__file__) + '/../doc')
    static_app = static.Cling(resource_filename('pdp', 'static'))

    data = PathDispatcher([
        ('^/{}/.*$'.format(bc_prism.url_base), bc_prism_data_server(global_config, bc_prism.ensemble_name)),
        ('^/{}/.*$'.format(bcsd_canada.url_base), bcsd_canada_data_server(global_config, bcsd_canada.ensemble_name)),
        ('^/{}/.*$'.format(vic_gen1.url_base), vic_gen1_data_server(global_config, vic_gen1.ensemble_name)),
        ('^/{}/.*$'.format(bccaq_extremes.url_base), bccaq_extremes_data_server(global_config, bccaq_extremes.ensemble_name)),
        ('^/{}/.*$'.format(hydro_stn.url_base), hydro_stn_data_server(global_config)),
        ('^/{}/.*$'.format(pcds.url_base), pcds_data_server(global_config)),
        ])

    main = PathDispatcher([
        ('^/css/(default|pcic).css$', static.Cling(resource_filename('pdp_util', 'data'))), # a bit of a hack for now
        ('^/check_auth_app/?$', check_auth),
        ('^/{}/.*$'.format(pcds.url_base), pcds_portal(global_config)),
        ('^/{}/.*$'.format(hydro_stn.url_base), hydro_stn_portal(global_config)),
        ('^/{}/.*$'.format(bc_prism.url_base), bc_prism_portal(global_config)),
        ('^/{}/.*$'.format(vic_gen1.url_base), vic_gen1_portal(global_config)),
        ('^/{}/.*$'.format(bcsd_canada.url_base), bcsd_canada_portal(global_config)),
        ('^/{}/.*$'.format(bccaq_extremes.url_base), bccaq_extremes_portal(global_config)),
        ('^/data/.*$', data),
        ('^/docs/.*$', docs_app),
        ],
        default=static_app
    )

    main = AnalyticsMiddleware(main, 'UA-20166041-3')
    main = SessionMiddleware(main, auto=1, data_dir=global_config['session_dir'])
    main = ErrorMiddleware(main)
    return main

