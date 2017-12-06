'''The pdp.portals.gridded_observations module configures a raster portal
 which serves gridded climate data used by the VIC model.'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata
from pdp_util.ensemble_members import EnsembleMemberLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig, raster_conf

ensemble_name = 'gridded-obs-met-data'
url_base = 'gridded_observations'

class GriddedObservationsEnsembleLister(EnsembleMemberLister):

    def list_stuff(self, ensemble):
        dataset_names = {
            "ANUSPLIN_CDA_v2012.1": "ANUSPLIN",
            "SYMAP_BC_v1": "VIC FORCINGS",
            "TPS_NWNA_v1": "TPS"}
        for dfv in ensemble.data_file_variables:
            yield dataset_names[dfv.file.run.model.short_name], dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')

def data_server(config, ensemble_name):
    dsn = config['dsn']
    conf = raster_conf(dsn, config, ensemble_name, url_base)
    data_server = wrap_auth(RasterServer(dsn, conf))
    return data_server

def portal(config):
    dsn = config['dsn']
    portal_config = {
        'title': 'Gridded Climate Observations',
        'ensemble_name': ensemble_name,
        'js_files' : 
            wrap_mini([
                'js/gridded_observations_map.js',
                'js/gridded_observations_controls.js',
                'js/gridded_observations_app.js'],
                basename=url_base, debug=(not config['js_min']))
    }

    portal_config = updateConfig(config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    conf = raster_conf(dsn, config, ensemble_name, url_base)
    catalog_server = RasterCatalog(dsn, conf) #No Auth

    menu = GriddedObservationsEnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
