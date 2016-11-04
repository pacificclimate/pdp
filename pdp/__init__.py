'''The pdp package ties together all of the aspects of the PCIC Data Portal (pdp).
   The base pdp module configures the application, sets up a URL hierarchy (a PathDispatcher instance),
   instantiates all of the responder applications and binds them to various PathDispatchers.
'''

__all__ = ['get_config', 'wrap_auth']

import sys, os
from os.path import dirname
import atexit
import re

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
    config_filename = os.environ.get('PDP_CONFIG', '/var/www/dataportal/config.yaml')
    try:
        with open(config_filename) as f:
            config = yaml.load(f)
    except IOError:
        print("pdp/__init__.py: An error occurred while trying to read the config file. Please make sure that the PDP_CONFIG env variable has been set and points to a valid file.")
        sys.exit(1)

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
        'version': parse_version("version"),
        'revision': parse_version("revision")
        }

    config = updateConfig(global_config, config)
    if config['session_dir'] == 'default':
        config['session_dir'] = resource_filename('pdp', 'pdp_session_dir')
    return config

def parse_version(type_):
    full_version = get_distribution('pdp').version
    return _parse_version(full_version, type_)

def _parse_version(full_version, type_):
    regex = ur"^((?:\w+\.?)+)\+?(.*)\.(\w{6})$"
    matches = re.match(regex, full_version)
    if matches:
        version, branch, sha = matches.groups()
        if type_ == "version":
            return version
        elif type_ == "revision":
            return "%s:%s" % (branch, sha)
    return "unknown"

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
