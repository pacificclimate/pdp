from pdp_util import session_scope
from pdp_util.raster import db_raster_configurator


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
    with session_scope(dsn) as sesh:
        conf = db_raster_configurator(sesh, "Download Data", 0.1, 0, ensemble_name,
                                      root_url=global_config['data_root'].rstrip('/') + '/' + data_base + '/')
    return conf
