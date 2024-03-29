'''Exposes globally defined WSGI apps as module variables
'''
from pkg_resources import resource_filename

import static
from werkzeug.wsgi import DispatcherMiddleware

from pdp.error import ErrorMiddleware
from ga_wsgi_client import AnalyticsMiddleware

# Station portals
import portals.pcds as pcds
import portals.hydro_stn_cmip5 as hydro_stn_cmip5

# Raster portals
import portals.bc_prism as bc_prism
import portals.bccaq2_downscale as bccaq2
import portals.bccaq2_cmip6 as bccaq2_cmip6
import portals.bccaq2_canesm5 as bccaq2_canesm5
import portals.mbcn_cmip6 as mbcn_cmip6
import portals.mbcn_canesm5 as mbcn_canesm5
import portals.gridded_observations as gridded_observations
import portals.vic_gen2 as vic_gen2


apps = (bc_prism, bccaq2, vic_gen2,
        gridded_observations, pcds,
        hydro_stn_cmip5, bccaq2_cmip6,
        bccaq2_canesm5, mbcn_cmip6, mbcn_canesm5)


def initialize_frontend(global_config, use_analytics=False):
    '''Frontend server with all portal pages and required resources
    '''

    docs_app = static.Cling(resource_filename('pdp', 'docs/html'))
    static_app = static.Cling(resource_filename('pdp', 'static'))

    mounts = {
        # Omit pcds frontend, because deprecated. (But we need the backend still.)
        app.url_base: app.mk_frontend(global_config)
        for app in apps if app != pcds
    }
    mounts.update({
        '/css/': static.Cling(resource_filename('pdp_util', 'data')),
        '/docs': docs_app
        })

    wsgi_app = DispatcherMiddleware(static_app, mounts)

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
