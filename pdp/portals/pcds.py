'''The pdp.portals.pcds module configures the Provincial Climate Data
Set portal.
'''

from pkg_resources import resource_filename

from werkzeug import DispatcherMiddleware

from pdp_util.agg import PcdsZipApp
from pdp_util.pcds_dispatch import PcdsDispatcher


__all__ = ['url_base', 'mk_backend']


url_base = '/pcds'


def mk_backend(config):
    dsn = config['pcds_dsn']
    dispatch_app = PcdsDispatcher(
        templates=resource_filename('pdp_util', 'templates'),
        ol_path=None,  # global_config['ol_path'],
        app_root=config['app_root'],
        conn_params=dsn
    )

    zip_app = PcdsZipApp(dsn)

    app = DispatcherMiddleware(zip_app, {
        '/lister': dispatch_app,
        '/agg': zip_app
    })
    return app
