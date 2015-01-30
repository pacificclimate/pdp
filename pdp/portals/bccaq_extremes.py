'''The pdp.portals.bccaq_extremes module configures a raster portal to serve ClimDEX data computed on the Canada-wide BCCAQ downscaled dataset.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata, db_raster_configurator
from pdp_util.ensemble_members import EnsembleMemberLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

class ClimdexEnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            ## FIXME
            yield dfv.file.run.emission.short_name, dfv.file.run.model.short_name, "annual" if "_yr_" in dfv.file.unique_id else "monthly", dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')

def portal(dsn, global_config):

    ensemble_name = 'bccaq_extremes'

    portal_config = {
        'title': 'Statistically Downscaled GCM Scenarios: Extremes',
        'ensemble_name': ensemble_name,
        'css_files' : [
            'css/plot.css' ],
        'js_files' :
            ['js/d3.v3.min.js'] +
            wrap_mini([
                'js/bccaq_extremes_map.js',
                'js/bccaq_extremes_controls.js',
                'js/bccaq_extremes_app.js'],
                basename='downscaled_gcm_extremes', debug=False
            )
    }

    portal_config = updateConfig(global_config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    with session_scope(dsn) as sesh:
        conf = db_raster_configurator(sesh, "Download Data", 0.1, 0, ensemble_name, 
            root_url=global_config['app_root'].rstrip('/') + '/downscaled_gcm_extremes/data/'
        )
        data_server = wrap_auth(RasterServer(dsn, conf))
        catalog_server = RasterCatalog(dsn, conf) #No Auth

    menu = ClimdexEnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/data/.*$', data_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
