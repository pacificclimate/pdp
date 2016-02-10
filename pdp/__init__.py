'''The pdp package ties together all of the aspects of the PCIC Data Portal (pdp).
   The base pdp module configures the application, sets up a URL hierarchy (a PathDispatcher instance),
   instantiates all of the responder applications and binds them to various PathDispatchers.
'''

__all__ = ['get_config', 'wrap_auth']

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


s2bool = lambda x: x.lower() in ('true', 'yes', 't', '1')

environment_config = {
    'app_root': os.environ.get('APP_ROOT', 'http://tools.pacificclimate.org/dataportal'),
    'data_root': os.environ.get('DATA_ROOT', 'http://tools.pacificclimate.org/dataportal/data'),
    'dsn': os.environ.get('DSN', 'postgresql://httpd_meta@atlas.pcic.uvic.ca/pcic_meta'),
    'pcds_dsn': os.environ.get('PCDS_DSN', 'postgresql://httpd@atlas.pcic.uvic.ca/crmp'),
    'js_min': s2bool(os.environ.get('JS_MIN', 'FALSE')),
    'geoserver_url': os.environ.get('GEOSERVER_URL', 'http://atlas.pcic.uvic.ca/geoserver/'),
    'ncwms_url': os.environ.get('NCWMS_URL',
                                'http://tools.pacificclimate.org/ncWMS-PCIC/wms').split(','),
    'tilecache_url': os.environ.get('TILECACHE_URL',
                                    'http://tiles.pacificclimate.org/tilecache/tilecache.py').split(','),
    'use_auth': s2bool(os.environ.get('USE_AUTH', 'TRUE')),
    'session_dir': os.environ.get('SESSION_DIR', 'default'),
    'clean_session_dir': s2bool(os.environ.get('CLEAN_SESSION_DIR', 'TRUE')),
    'use_analytics': s2bool(os.environ.get('USE_ANALYTICS', 'TRUE')),
    'analytics': os.environ.get('ANALYTICS', 'UA-20166041-3'),
    'ensemble_name': os.environ.get('ENSEMBLE_NAME', ''),
}

def get_config():
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
            ], debug=(not environment_config['js_min'])),
        'templates': resource_filename('pdp', 'templates'),
        'version': get_distribution('pdp').version
        }

    config = updateConfig(global_config, environment_config)
    if config['session_dir'] == 'default':
        config['session_dir'] = resource_filename('pdp', 'pdp_session_dir')
    return config

def clean_session_dir(session_dir, should_I):
    if should_I and os.path.exists(session_dir):
        print('Removing session directory {}'.format(session_dir))
        rmtree(session_dir)


# auth wrappers
def wrap_auth(app, required=False):
    '''This function wraps a WSGI application with the PcicOidMiddleware for session management and optional authentication
    '''
    config = get_config()
    app = PcicOidMiddleware(app,
                            templates=resource_filename('pdp', 'templates'),
                            root=config['app_root'],
                            auth_required=required)
    return app
