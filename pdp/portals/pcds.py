'''The pdp.portals.pcds module configures the Provincial Climate Data Set portal.
'''

from pdp import wrap_auth
from pdp_util.map import MapApp

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

def portal(dsn, global_config):
    pcds_config = {
        'title': 'BC Station Data - PCDS',
        'js_files' : wrap_mini([
            'js/crmp_map.js',
            'js/crmp_controls.js',
            'js/crmp_download.js',
            'js/crmp_filters.js',
            'js/crmp_app.js'], 
            basename='pcds', debug=False
        )
    }

    pcds_map_config = updateConfig(global_config, pcds_config)
    return wrap_auth(MapApp(**pcds_map_config), required=False)
