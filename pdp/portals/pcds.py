from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator

from pdp import global_config, updateConfig

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

pcds_map_config = updateConfig(global_config, pcds_config)
map_app = wrap_auth(MapApp(**pcds_map_config), required=False)