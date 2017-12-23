'''The pdp.portals.pcds module configures the Provincial Climate Data Set portal.
'''

from pkg_resources import resource_filename

from werkzeug import DispatcherMiddleware

from pdp_util.map import MapApp
from pdp.minify import wrap_mini
from pdp.portals import updateConfig

from pdp_util.counts import CountStationsApp, CountRecordLengthApp
from pdp_util.legend import LegendApp
from pdp_util.agg import PcdsZipApp
from pdp_util.pcds_dispatch import PcdsDispatcher


__all__ = ('url_base', 'mk_frontend', 'mk_backend')


url_base = '/pcds'

def mk_backend(config):
    dsn = config['pcds_dsn']
    dispatch_app = PcdsDispatcher(
        templates=resource_filename('pdp_util', 'templates'),
        ol_path=None, #global_config['ol_path'],
        app_root=config['app_root'],
        conn_params=dsn
        )

    zip_app = PcdsZipApp(dsn)

    app = DispatcherMiddleware(zip_app, {
        '/lister': dispatch_app,
        '/agg': zip_app
    })
    return app

def mk_frontend(config):
    dsn = config['pcds_dsn']
    pcds_config = {
        'title': 'BC Station Data - PCDS',
        'js_files' : wrap_mini([
            'js/crmp_map.js',
            'js/crmp_controls.js',
            'js/crmp_download.js',
            'js/crmp_filters.js',
            'js/crmp_app.js'], 
            basename=url_base, debug=(not config['js_min'])
        )
    }

    count_stations_app = CountStationsApp(dsn)
    record_length_app = CountRecordLengthApp(dsn, max_stns=100)
    legend_app = LegendApp(dsn)

    pcds_map_config = updateConfig(config, pcds_config)
    map_app = MapApp(**pcds_map_config)

    return DispatcherMiddleware(map_app, {
        '/map': map_app,
        '/record_length': record_length_app,
        '/count_stations': count_stations_app,
        '/images/legend': legend_app
    })
