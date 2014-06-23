'''The pdp.portals.bccaq_extremes module configures a raster portal to serve ClimDEX data computed on the Canada-wide BCCAQ downscaled dataset.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator
from pdp_util.ensemble_members import ClimdexEnsembleLister

from pdp.minify import wrap_mini
from pdp import dsn, global_config, updateConfig

ensemble_name = 'bccaq_extremes'

portal_config = {
    'title': 'BCCAQ Extremes',
    'ensemble_name': ensemble_name,
    'css_files' : [
        'css/plot.css' ],
    'js_files' :
        wrap_mini([
            'js/d3.js',
            'js/bccaq_extremes_map.js',
            'js/bccaq_extremes_controls.js',
            'js/canada_ex_controls.js',
            'js/bccaq_extremes_app.js'],
            basename='downscaled_gcms', debug=True
            )
    }

portal_config = updateConfig(global_config, portal_config)
map_app = wrap_auth(MapApp(**portal_config), required=False)

dsn = dsn + '?application_name=pdp_bccaq_extremes'
with session_scope(dsn) as sesh:
    conf = db_raster_configurator(sesh, "Download Data", 0.1, 0, ensemble_name, 
        root_url=global_config['app_root'].rstrip('/') + '/bccaq_extremes/data/'
    )
    data_server = wrap_auth(RasterServer(dsn, conf))
    catalog_server = RasterCatalog(dsn, conf) #No Auth

menu = ClimdexEnsembleLister(dsn)

portal = PathDispatcher([
    ('^/map/?.*$', map_app),
    ('^/catalog/.*$', catalog_server),
    ('^/data/.*$', data_server),
    ('^/menu.json.*$', menu)
    ])
