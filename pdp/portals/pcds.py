from pdp import wrap_auth
from pdp_util.map import MapApp

from pdp.minify import wrap_mini
from pdp import global_config, updateConfig

pcds_config = {
    'title': 'BC Station Data - PCDS',
    'js_files' : wrap_mini([
        'js/crmp_map.js',
        'js/crmp_controls.js',
        'js/crmp_download.js',
        'js/crmp_filters.js',
        'js/crmp_app.js'], 
        basename='pcds', debug=True
        )
    }

pcds_map_config = updateConfig(global_config, pcds_config)
map_app = wrap_auth(MapApp(**pcds_map_config), required=False)
