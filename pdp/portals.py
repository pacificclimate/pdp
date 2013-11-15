

from pdp import global_config, updateConfig
from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator

from pdp import dsn

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
pcds_map = wrap_auth(MapApp(**pcds_map_config), required=False)

canada_ex_config = {
    'title': 'Canadian Climate Coverage (BETA)',
    'ensemble_name': 'bcsd_downscale_canada',
    'js_files' : [
        'js/pdp_raster_map.js',
        'js/canada_ex_map.js',
        'js/canada_ex_controls.js',
        'js/canada_ex_app.js'
        ]
    }

bc_prism_config = {
    'title': 'BC PRISM Raster Portal (BETA)',
    'ensemble_name': 'bc_prism',
    'js_files' : [
        'js/pdp_raster_map.js',
        'js/prism_demo_map.js',
        'js/prism_demo_controls.js',
        'js/prism_demo_app.js'
        ]
    }

canada_ex_map_config = updateConfig(global_config, canada_ex_config)
canada_ex_map = wrap_auth(MapApp(**canada_ex_map_config), required=False)

bc_prism_map_config = updateConfig(global_config, bc_prism_config)
bc_prism_map = wrap_auth(MapApp(**bc_prism_map_config), required=False)

servers = {}
catalogs = {}
with session_scope(dsn) as sesh:
    for ensemble_name in ['bcsd_downscale_canada', 'bc_prism']:
        conf = db_raster_configurator(sesh, "Download Data", 0.1, 0, ensemble_name, 
            root_url=global_config['app_root'].rstrip('/') + '/' + 
                ensemble_name + '/data/'
        )
        servers[ensemble_name] = wrap_auth(RasterServer(dsn, conf))
        catalogs[ensemble_name] = RasterCatalog(dsn, conf) #No Auth


bc_prism = PathDispatcher('/bc_prism', [
    ('^/map/.*$', bc_prism_map),
    ('^/catalog/.*$', catalogs['bc_prism']),
    ('^/data/.*$', servers['bc_prism'])
    ])

bcsd_canada = PathDispatcher('/bcsd_downscale_canada', [
    ('^/map/.*$', canada_ex_map),
    ('^/catalog/.*$', catalogs['bcsd_downscale_canada']),
    ('^/data/.*$', servers['bcsd_downscale_canada'])
    ])