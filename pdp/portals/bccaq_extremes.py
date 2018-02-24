'''The pdp.portals.bccaq_extremes module configures a raster portal to
serve ClimDEX data computed on the Canada-wide BCCAQ downscaled
dataset.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata
from pdp_util.ensemble_members import EnsembleMemberLister

from pdp.minify import wrap_mini
from pdp.portals import updateConfig, raster_conf

ensemble_name = 'bccaq_extremes'
url_base = 'downscaled_gcm_extremes'


class ClimdexEnsembleLister(EnsembleMemberLister):
    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            # FIXME
            yield dfv.file.run.emission.short_name,
            dfv.file.run.model.short_name, "annual" if \
                "_yr_" in dfv.file.unique_id else "monthly",
            dfv.netcdf_variable_name,
            dfv.file.unique_id.replace('+', '-')


def data_server(config, ensemble_name):
    dsn = config['dsn']
    conf = raster_conf(dsn, config, ensemble_name, url_base)
    data_server = wrap_auth(RasterServer(dsn, conf))
    return data_server


def portal(config):
    dsn = config['dsn']
    portal_config = {
        'title': 'Statistically Downscaled GCM Scenarios: Extremes',
        'ensemble_name': ensemble_name,
        'css_files': [
            'css/plot.css'],
        'js_files':
            ['js/d3.v3.min.js'] +
            wrap_mini([
                'js/bccaq_extremes_map.js',
                'js/bccaq_extremes_controls.js',
                'js/bccaq_extremes_app.js'],
                basename=url_base, debug=(not config['js_min'])
        )
    }

    portal_config = updateConfig(config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    conf = raster_conf(dsn, config, ensemble_name, url_base)
    catalog_server = RasterCatalog(dsn, conf)  # No Auth

    menu = ClimdexEnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
