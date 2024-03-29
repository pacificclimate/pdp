'''The pdp package ties together all of the aspects of the PCIC Data
   Portal (pdp).  The base pdp module configures the application, sets
   up a URL hierarchy (a DispatcherMiddleware instance), instantiates
   all of the responder applications and binds them to various
   DispatcherMiddlewares.
'''

__all__ = ['get_config']

import os
import re

from pkg_resources import resource_filename, get_distribution

from pdp.minify import wrap_mini
from pdp.portals import updateConfig


def get_config_from_environment():
    """
    Extract configuration properties from environment variables.

    In order to add a new environment variable to the configuration, do two
    things:
    1. Add an item here.
    2. If that variable needs to be carried into the JavaScript apps, modify
       `pdp/templates/map.html` to add the new property to the global variable
       `pdp`.
    """
    defaults = {
        'app_root': 'http://tools.pacificclimate.org/dataportal',
        'data_root': 'http://tools.pacificclimate.org/dataportal/data',
        'title': '',
        'ensemble_name': '',
        'dsn': 'postgresql://user:pass@host/database',
        'pcds_dsn': 'postgresql://user:pass@host/database',
        'js_min': 'False',
        'geoserver_url': 'http://tools.pacificclimate.org/geoserver/',
        'ncwms_url': 'http://tools.pacificclimate.org/ncWMS-PCIC/wms',
        'old_ncwms_url': 'https://services.pacificclimate.org/ncWMS-PCIC/',
        'na_tiles_url': 'https://services.pacificclimate.org/mapproxy/service',
        'bc_basemap_url': 'http://142.104.230.53:30790/osm-bc-lite-test/$${z}/$${x}/$${y}.png',
        'use_analytics': 'True',
        'analytics': 'UA-20166041-3'  # change for production
    }
    config = {
        key: os.environ.get(key.upper(), default)
        for key, default in defaults.items()
    }
    # evaluate a few config items that need to be objects (not strings)
    config['js_min'] = (config['js_min'] == 'True')
    config['use_analytics'] = (config['use_analytics'] == 'True')
    return config


def get_config():
    env_config = get_config_from_environment()
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
            'js/ie8.js',  # must be included before OL
            'js/jquery-1.10.2.js',
            'js/jquery-ui-1.10.2.custom.js',
            'js/zebra.js',
            'js/OL/OpenLayers-2.13.1.js',
            'js/proj4js-compressed.js',
            'js/multiaccordion.js',
            'js/lodash.custom.min.js',
        ] + wrap_mini([
            'js/condExport.js',
            'js/classes.js',
            'js/calendars.js',
            'js/data-services.js',
            'js/pdp_dom_library.js',
            'js/pdp_controls.js',
            'js/pdp_download.js',
            'js/pdp_filters.js',
            'js/pdp_map.js',
            'js/pdp_raster_map.js',
            'js/utils.js',
        ], debug=(not env_config['js_min'])),
        'templates': resource_filename('pdp', 'templates'),
        'version': parse_version("version"),
        'revision': parse_version("revision")
    }

    return updateConfig(global_config, env_config)


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
