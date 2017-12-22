'''The pdp package ties together all of the aspects of the PCIC Data
   Portal (pdp).  The base pdp module configures the application, sets
   up a URL hierarchy (a DispatcherMiddleware instance), instantiates
   all of the responder applications and binds them to various
   DispatcherMiddlewares.
'''

__all__ = ['get_config']

import sys, os
import re

from pkg_resources import resource_filename, get_distribution
from shutil import rmtree
import yaml

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
