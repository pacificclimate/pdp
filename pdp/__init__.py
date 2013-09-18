import os
import re

from pkg_resources import resource_filename, get_distribution
from tempfile import mkdtemp

from genshi.core import Markup
import static
from beaker.middleware import SessionMiddleware

from pdp_util.auth import PcicOidMiddleware, check_authorized_return_email
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, db_raster_configurator
from pdp_util.filter_options import FilterOptions
from pdp_util.ensemble_members import EnsembleMemberLister
from pdp_util.counts import CountStationsApp, CountRecordLengthApp
from pdp_util.legend import LegendApp
from pdp_util.agg import PcdsZipApp
from pdp_util.pcds_dispatch import PcdsDispatcher

def updateConfig(d1, d2):
    # standard dict update with the exception of joining lists
    res = d1.copy()
    for k, v in d2.items():
        if k in d1 and type(v) == list:
            # join any config lists
            res[k] = d1[k] + d2[k]
        else: # overwrite or add anything else
            res[k] = v
            return res

here = os.getcwd()

dsn = 'postgresql://pcic_meta@monsoon.pcic/pcic_meta'
pcds_dsn = 'postgresql://httpd@monsoon.pcic/crmp'

global_config = {
    'app_root': 'http://basalt.pcic.uvic.ca',
    'title': "CRMP Network Data",
    'css_files': [
        'css/jquery-ui-1.10.2.custom.css',
        'css/main.css',
        'css/map.css',
        'css/header.css',
        'css/footer.css',
        'css/login.css',
        'css/controls.css',
        'css/accordionmenu.css'],
    'js_files': [
        'js/jquery-1.9.1.js',
        'js/jquery-ui-1.10.2.custom.js',
        'js/zebra.js',
        'js/OL/OpenLayers.js',
        'js/proj4js-compressed.js',
        'js/OpacitySlider.js',
        'js/accordionmenu.js',
        'js/pdp_dom_library.js',
        'js/pdp_controls.js',
        'js/pdp_download.js',
        'js/pdp_filters.js',
        'js/pdp_map.js'
        ],
    'geoserver_url': 'http://medusa.pcic.uvic.ca/geoserver/',
    'ncwms_url': 'http://medusa.pcic.uvic.ca/ncwms/',
    'templates': os.path.join(here, 'pdp', 'templates'),
    'session_dir': mkdtemp(),
    'version': get_distribution('pdp').version
    }

pcds_config = {
    'title': 'CRMP Network Data',
    'js_files' : [
        'js/pdp_vector_map.js',
        'js/crmp_map.js',
        'js/crmp_controls.js',
        'js/crmp_download.js',
        'js/crmp_filters.js',
        'js/crmp_app.js'
        ]
    }

raster_config = {
    'title': 'Raster Data',
    'js_files' : [
        'js/pdp_raster_map.js',
        'js/raster_map.js',
        ## TODO: add raster specific controls/download
#        'js/raster_controls.js',
#        'js/raster_download.js',
#        'js/raster_filters.js',
        'js/raster_app.js'
        ]
    }

# auth wrappers
def wrap_auth(app, required=True):
    app = PcicOidMiddleware(app,
                            templates=resource_filename('pdp_util', 'templates'),
                            root=global_config['app_root'],
                            auth_required=required)
    return SessionMiddleware(app, auto=1, data_dir=global_config['session_dir'])

check_auth = wrap_auth(check_authorized_return_email, required=False)

pcds_map_config = updateConfig(global_config, pcds_config)
pcds_map = wrap_auth(MapApp(**pcds_map_config), required=False)

raster_map_config = updateConfig(global_config, raster_config)
raster_map = wrap_auth(MapApp(**raster_map_config), required=False)

zip_app = wrap_auth(PcdsZipApp(pcds_dsn), required=True)

count_stations_app = CountStationsApp(pcds_dsn)
record_length_app = CountRecordLengthApp(pcds_dsn, max_stns=100)
legend_app = LegendApp(pcds_dsn)

static_app = static.Cling(resource_filename('pdp', 'static'))

dispatch_app = wrap_auth(PcdsDispatcher(templates=resource_filename('pdp', 'static'),
                                        ol_path=None, #global_config['ol_path'],
                                        app_root=global_config['app_root'],
                                        conn_params=pcds_dsn
                                        ),
                        required=True)


class PathDispatcher(object):
    '''
    Simple wsgi app to route URL based on regex patterns at the beginning of the path.
    Consume "path_to" from the PATH_INFO environment variable
    '''
    def __init__(self, path_to, urls, default=None):
        self.path_to = path_to
        self.urls = urls
        self.default = default

    def __call__(self, environ, start_response):
        path = environ['PATH_INFO'] + environ['SCRIPT_NAME']
        if not path.startswith(self.path_to):
            # 404
            start_response('404')
            return [path, " not found"]
        path = path.replace(self.path_to, '', 1)
        for pattern, app in self.urls:
            m = re.match(pattern, path)
            if m:
                environ['PATH_INFO'] = path
                return app(environ, start_response)

        if self.default:
            return self.default(environ, start_response)
        else:
            start_response('404 Not Found', [])
            return [path, " not found"]

conf = db_raster_configurator("Canada downscaled data", 0.1, 0, 'canada_map', root_url=global_config['app_root'].rstrip('/') +'/data/')
raster_server = RasterServer(conf)

lister = EnsembleMemberLister(dsn)

auth = PathDispatcher('/auth', [
    ('^/pcds/.*$', dispatch_app),
    #        ('^/pydap/.*$', pydap_app),
    ('^/agg/?$', zip_app),
    ])

data = PathDispatcher('/data', [
    ('^/.*$', raster_server)
    ])

apps = PathDispatcher('/apps', [
    ('^/record_length/?$', record_length_app),
    ('^/count_stations/?$', count_stations_app),
    ])    
    
main = PathDispatcher('', [
    ('^/data/.*$', data),
    ('^/images/legend/.*\.png$', legend_app),
    ('^/check_auth_app/?$', check_auth),
    ('^/pcds_map/.*$', pcds_map),
    ('^/raster_map/.*$', raster_map),
    ('^/auth.*$', auth),
    ('^/apps/.*$', apps),
    ('^/ensemble_datasets.json.*$', lister),
    #('^/data/.*$', raster_server),
    ('^/(css|js|images)/.*$', static_app),
    ('^/$', pcds_map)
    ],
#    default=pcds_map
)
# main
