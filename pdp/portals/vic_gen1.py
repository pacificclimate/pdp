'''The pdp.portals.vic_gen1 module configures a raster portal which serves the first generation of output from the VIC Hydrologic Model. The spatial domain is specific watersheds within BC and the model was run using CMIP3 forcings.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator
from pdp_util.ensemble_members import VicGen1EnsembleLister

from pdp.minify import wrap_mini
from pdp import dsn, global_config, updateConfig

ensemble_name = 'vic_gen1'

portal_config = {
    'title': 'Gridded Hydrologic Model Output',
    'ensemble_name': ensemble_name,
    'js_files' : 
        wrap_mini([
            'js/vic_gen1_map.js',
            'js/vic_gen1_controls.js',
            'js/vic_gen1_app.js'],
            basename='hydro_model_out', debug=False)
    }

portal_config = updateConfig(global_config, portal_config)
map_app = wrap_auth(MapApp(**portal_config), required=False)

dsn = dsn + '?application_name=pdp_vicgen1'
with session_scope(dsn) as sesh:
    conf = db_raster_configurator(sesh, "Download Data", 0.1, 0, ensemble_name, 
        root_url=global_config['app_root'].rstrip('/') + '/hydro_model_out/data/'
    )
    data_server = wrap_auth(RasterServer(dsn, conf))
    catalog_server = RasterCatalog(dsn, conf) #No Auth

menu = VicGen1EnsembleLister(dsn)

portal = PathDispatcher([
    ('^/map/?.*$', map_app),
    ('^/catalog/.*$', catalog_server),
    ('^/data/.*$', data_server),
    ('^/menu.json.*$', menu)
    ])
