'''The pdp.portals.bc_prism module configures a raster portal to serve the 1971-2000, 800 meter resolution PRISM dataset for BC.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata
from pdp_util.ensemble_members import EnsembleMemberLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig, raster_conf

ensemble_name = 'bc_prism'
url_base = 'bc_prism'

class PrismEnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.model.short_name, dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')

def data_server(dsn, global_config, ensemble_name):
    conf = raster_conf(dsn, global_config, ensemble_name)
    data_server = wrap_auth(RasterServer(dsn, conf))
    return data_server

def portal(dsn, global_config):
    portal_config = {
        'title': 'High-Resolution PRISM Climatology',
        'ensemble_name': ensemble_name,
        'js_files' : wrap_mini([
            'js/prism_demo_map.js',
            'js/prism_demo_controls.js',
            'js/prism_demo_app.js'],
            basename=url_base, debug=False)
    }

    portal_config = updateConfig(global_config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    conf = raster_conf(dsn, global_config, ensemble_name)
    catalog_server = RasterCatalog(dsn, conf) #No Auth

    menu = PrismEnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
