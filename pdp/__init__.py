import os

from pkg_resources import resource_filename, get_distribution
from tempfile import mkdtemp

from genshi.core import Markup
import static
from beaker.middleware import SessionMiddleware

from pdp_util import session_scope
from pdp_util.auth import PcicOidMiddleware, check_authorized_return_email
from pdp_util.map import MapApp
from pdp_util.ensemble_members import EnsembleMemberLister
from pdp_util.counts import CountStationsApp, CountRecordLengthApp
from pdp_util.legend import LegendApp
from pdp_util.agg import PcdsZipApp
from pdp_util.pcds_dispatch import PcdsDispatcher
from analytics import AnalyticsMiddleware
from pdp.error import ErrorMiddleware
from pdp.dispatch import PathDispatcher

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
    'app_root': 'http://medusa.pcic.uvic.ca/dataportal',
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
        'js/pdp_map.js',
        'js/pdp_auth.js'
        ],
    'geoserver_url': 'http://medusa.pcic.uvic.ca/geoserver/',
    'ncwms_url': 'http://medusa.pcic.uvic.ca/ncWMS/wms',
    'tilecache_url': 'http://medusa.pcic.uvic.ca/tilecache/tilecache.py',
    'ensemble_name': '',
    'templates': os.path.join(here, 'pdp', 'templates'),
    'session_dir': mkdtemp(),
    'version': get_distribution('pdp').version
    }


# auth wrappers
def wrap_auth(app, required=True):
    app = PcicOidMiddleware(app,
                            templates=resource_filename('pdp_util', 'templates'),
                            root=global_config['app_root'],
                            auth_required=required)
    return app

check_auth = wrap_auth(check_authorized_return_email, required=False)

from portals.pcds import map_app as pcds_map

zip_app = wrap_auth(PcdsZipApp(pcds_dsn), required=True)

count_stations_app = CountStationsApp(pcds_dsn)
record_length_app = CountRecordLengthApp(pcds_dsn, max_stns=100)
legend_app = LegendApp(pcds_dsn)

static_app = static.Cling(resource_filename('pdp', 'static'))

dispatch_app = wrap_auth(PcdsDispatcher(templates=resource_filename('pdp_util', 'templates'),
                                        ol_path=None, #global_config['ol_path'],
                                        app_root=global_config['app_root'],
                                        conn_params=pcds_dsn
                                        ),
                        required=True)

lister = EnsembleMemberLister(dsn)

from portals.bc_prism import portal as bc_prism

from portals.bcsd_downscale_canada import portal as bcsd_canada

auth = PathDispatcher([
    ('^/pcds/.*$', dispatch_app),
    # ('^/pydap/.*$', pydap_app),
    ('^/agg/?$', zip_app),
    ])

apps = PathDispatcher([
    ('^/record_length/?$', record_length_app),
    ('^/count_stations/?$', count_stations_app),
    ])    
    
main = PathDispatcher([
    ('^/images/legend/.*\.png$', legend_app),
    ('^/check_auth_app/?$', check_auth),
    ('^/pcds_map/.*$', pcds_map),
    ('^/bc_prism/.*$', bc_prism),
    ('^/bcsd_downscale_canada/.*$', bcsd_canada),
    ('^/auth.*$', auth),
    ('^/apps/.*$', apps),
    ('^/ensemble_datasets.json.*$', lister)
    ],
    default=static_app
)

main = AnalyticsMiddleware(main, 'UA-20166041-3')
main = SessionMiddleware(main, auto=1, data_dir=global_config['session_dir'])
main = ErrorMiddleware(main)

# main
