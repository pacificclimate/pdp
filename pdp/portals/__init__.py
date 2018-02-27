from werkzeug import DispatcherMiddleware

from pdp_util import session_scope
from pdp_util.raster import db_raster_configurator, RasterServer, RasterCatalog
from pdp_util.raster import RasterMetadata
from pdp_util.map import MapApp

from pdp.minify import wrap_mini


def updateConfig(d1, d2):
    '''standard dict update with the exception of joining lists'''
    res = d1.copy()
    for k, v in d2.items():
        if k in d1 and type(v) == list:
            # join any config lists
            res[k] = d1[k] + d2[k]
        else:  # overwrite or add anything else
            res[k] = v
    return res


def raster_conf(dsn, global_config, ensemble_name, data_base=None):
    if data_base is None:
        data_base = ensemble_name
    root_url = global_config['data_root'].rstrip('/') + '/' + data_base + '/'
    with session_scope(dsn) as sesh:
        conf = db_raster_configurator(
            sesh, "Download Data", 0.1, 0, ensemble_name,
            root_url=root_url
        )
    return conf


def data_server(config, ensemble_name):
    dsn = config['dsn']
    conf = raster_conf(dsn, config, ensemble_name)
    data_server = RasterServer(dsn, conf)
    return data_server


def make_raster_frontend(config, ensemble_name, url_base, title,
                         ensemble_lister_class, js_files, css_files=[]):
    dsn = config['dsn']
    portal_config = {
        'title': title,
        'ensemble_name': ensemble_name,
        'css_files': css_files,
        'js_files':
            wrap_mini(js_files,
                      basename=url_base, debug=(not config['js_min']))
    }

    portal_config = updateConfig(config, portal_config)
    map_app = MapApp(**portal_config)

    conf = raster_conf(dsn, config, ensemble_name, url_base)
    catalog_server = RasterCatalog(dsn, conf)

    menu = ensemble_lister_class(dsn)

    metadata = RasterMetadata(dsn)

    return DispatcherMiddleware(map_app, {
        '/map': map_app,
        '/catalog': catalog_server,
        '/menu.json': menu,
        '/metadata.json': metadata
    })
