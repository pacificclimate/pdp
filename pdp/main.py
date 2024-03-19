'''Exposes globally defined WSGI apps as module variables
'''
from pkg_resources import resource_filename

import static
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from pdp.error import ErrorMiddleware

# Station portals
import pdp.portals.pcds as pcds
import pdp.portals.hydro_stn_archive as hydro_stn_archive
import pdp.portals.hydro_stn_cmip5 as hydro_stn_cmip5

# Raster portals
import pdp.portals.bc_prism as bc_prism
import pdp.portals.bccaq2_downscale as bccaq2
import pdp.portals.bccaq2_cmip6 as bccaq2_cmip6
import pdp.portals.bccaq2_canesm5 as bccaq2_canesm5
import pdp.portals.gridded_observations as gridded_observations
import pdp.portals.vic_gen1 as vic_gen1
import pdp.portals.vic_gen2 as vic_gen2


apps = (bc_prism, bccaq2, vic_gen1, vic_gen2,
        gridded_observations, pcds,
        hydro_stn_archive, hydro_stn_cmip5, bccaq2_cmip6,
        bccaq2_canesm5, mbcn_cmip6, mbcn_canesm5)


def initialize_frontend(global_config):
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

    return ErrorMiddleware(wsgi_app)


def initialize_backend(global_config):
    '''Backend DispatcherMiddleware with all data servers
    '''
    mounts = {
        app.url_base: app.mk_backend(global_config)
        for app in apps
    }

    static_app = static.Cling(resource_filename('pdp', 'static'))
    wsgi_app = DispatcherMiddleware(static_app, mounts)

    return ErrorMiddleware(wsgi_app)


def initialize_dev_server(global_config):
    '''Development server
    '''
    return DispatcherMiddleware(
        initialize_frontend(global_config),
        {'/data': initialize_backend(global_config)}
    )
