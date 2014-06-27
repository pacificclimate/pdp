from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator

from pdp.minify import wrap_mini
from pdp import global_config, updateConfig

hydro_stn_config = {
    'title': 'PCIC Hydrology Gauge data',
    'js_files' : 
         wrap_mini([
            'js/hydro_stn_map.js',
            'js/hydro_stn_controls.js',
            'js/hydro_stn_download.js',
            'js/hydro_stn_filters.js',
            'js/hydro_stn_app.js'],
            basename='hydro_stn', debug=False
            ) 
    }

hydro_stn_map_config = updateConfig(global_config, hydro_stn_config)
hydro_stn_app = wrap_auth(MapApp(**hydro_stn_map_config), required=False)
