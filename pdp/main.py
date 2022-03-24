'''Exposes globally defined WSGI apps as module variables
'''
from pkg_resources import resource_filename

import static
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from pdp.error import ErrorMiddleware
from ga_wsgi_client import AnalyticsMiddleware

# Station portals
import pdp.portals.pcds as pcds
import pdp.portals.hydro_stn_archive as hydro_stn_archive
import pdp.portals.hydro_stn_cmip5 as hydro_stn_cmip5

# Raster portals
import pdp.portals.bc_prism as bc_prism
import pdp.portals.downscale_archive as downscale_archive
import pdp.portals.bccaq2_downscale as bccaq2
import pdp.portals.bccaq_extremes as bccaq_extremes
import pdp.portals.gridded_observations as gridded_observations
import pdp.portals.vic_gen1 as vic_gen1
import pdp.portals.vic_gen2 as vic_gen2


apps = (bc_prism, downscale_archive, bccaq2, vic_gen1, vic_gen2,
        gridded_observations, bccaq_extremes, pcds,
        hydro_stn_archive, hydro_stn_cmip5)


def initialize_frontend(global_config, use_analytics=False):
    '''Frontend server with all portal pages and required resources
    '''

    docs_app = static.Cling(resource_filename('pdp', 'docs/html'))
    static_app = static.Cling(resource_filename('pdp', 'static'))

    mounts = {
        app.url_base: app.mk_frontend(global_config)
        for app in apps
    }
    mounts.update({
        '/pcds_map': pcds.mk_frontend(global_config),  # legacy url support
        '/css/': static.Cling(resource_filename('pdp_util', 'data')),
        '/docs': docs_app
        })

    wsgi_app = DispatcherMiddleware(static_app, mounts)

    use_analytics = False
    if use_analytics:
        wsgi_app = AnalyticsMiddleware(wsgi_app, global_config['analytics'])
    return ErrorMiddleware(wsgi_app)


def initialize_backend(global_config, use_analytics=False):
    '''Backend DispatcherMiddleware with all data servers
    '''
    mounts = {
        app.url_base: app.mk_backend(global_config)
        for app in apps
    }

    static_app = static.Cling(resource_filename('pdp', 'static'))
    wsgi_app = DispatcherMiddleware(static_app, mounts)

    use_analytics = False
    if use_analytics:
        wsgi_app = AnalyticsMiddleware(wsgi_app, global_config['analytics'])
    return ErrorMiddleware(wsgi_app)


def initialize_dev_server(global_config, use_analytics=False):
    '''Development server
    '''
    return DispatcherMiddleware(
        initialize_frontend(global_config, use_analytics),
        {'/data': initialize_backend(global_config, use_analytics)}
    )
