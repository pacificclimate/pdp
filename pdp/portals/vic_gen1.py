'''The pdp.portals.vic_gen1 module configures a raster portal which
serves the first generation of output from the VIC Hydrologic
Model. The spatial domain is specific watersheds within BC and the
model was run using CMIP3 forcings.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata
from pdp_util.ensemble_members import EnsembleMemberLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig, raster_conf

ensemble_name = 'vic_gen1'
url_base = 'hydro_model_out'


class VicGen1EnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield dfv.file.run.emission.short_name,
            dfv.file.run.model.short_name, dfv.netcdf_variable_name,
            dfv.file.unique_id.replace('+', '-')


def data_server(config, ensemble_name):
    dsn = config['dsn']
    conf = raster_conf(dsn, config, ensemble_name, url_base)
    data_server = wrap_auth(RasterServer(dsn, conf))
    return data_server


def portal(config):
    dsn = config['dsn']
    portal_config = {
        'title': 'Gridded Hydrologic Model Output',
        'ensemble_name': ensemble_name,
        'js_files':
            wrap_mini([
                'js/vic_gen1_map.js',
                'js/vic_gen1_controls.js',
                'js/vic_gen1_app.js'],
                basename=url_base, debug=(not config['js_min']))
    }

    portal_config = updateConfig(config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    conf = raster_conf(dsn, config, ensemble_name, url_base)
    catalog_server = RasterCatalog(dsn, conf)  # No Auth

    menu = VicGen1EnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
