'''The pdp.portals.vic_gen1 module configures a raster portal which serves the first generation of output from the VIC Hydrologic Model. The spatial domain is specific watersheds within BC and the model was run using CMIP3 forcings.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata
from pdp_util.ensemble_members import EnsembleMemberLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig, raster_conf

class VicGen1EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name, dfv.file.run.model.short_name, dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')

def data_server(dsn, global_config, ensemble_name):
    conf = raster_conf(dsn, global_config, ensemble_name, 'hydro_model_out')
    data_server = wrap_auth(RasterServer(dsn, conf))
    return data_server

def portal(dsn, global_config):

    ensemble_name = 'vic_gen1'

    portal_config = {
        'title': 'Gridded Hydrologic Model Output',
        'ensemble_name': ensemble_name,
        'js_files' : 
            wrap_mini([
                'js/vic_gen1_map.js',
                'js/vic_gen1_controls.js',
                'js/vic_gen1_app.js'],
                basename='hydro_model_out', debug=False)
    }

    portal_config = updateConfig(global_config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    conf = raster_conf(dsn, global_config, ensemble_name, 'hydro_model_out')
    catalog_server = RasterCatalog(dsn, conf) #No Auth

    menu = VicGen1EnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
