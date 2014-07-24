'''The pdp.portals.bc_prism module configures a raster portal to serve the 1971-2000, 800 meter resolution PRISM dataset for BC.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator
from pdp_util.ensemble_members import PrismEnsembleLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

def portal(dsn, global_config):

    ensemble_name = 'bc_prism'

    portal_config = {
        'title': 'High-Resolution PRISM Climatology',
        'ensemble_name': ensemble_name,
        'js_files' : wrap_mini([
            'js/prism_demo_map.js',
            'js/prism_demo_controls.js',
            'js/prism_demo_app.js'],
            basename='bc_prism', debug=False)
    }

    portal_config = updateConfig(global_config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    dsn = dsn + '?application_name=pdp_prism'
    with session_scope(dsn) as sesh:
        conf = db_raster_configurator(sesh, "Download Data", 0.1, 0, ensemble_name, 
            root_url=global_config['app_root'].rstrip('/') + '/' + 
            ensemble_name + '/data/'
        )
        data_server = wrap_auth(RasterServer(dsn, conf))
        catalog_server = RasterCatalog(dsn, conf) #No Auth

    menu = PrismEnsembleLister(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/data/.*$', data_server),
        ('^/menu.json.*$', menu)
    ])
