'''The pdp.portals.bc_prism module configures a raster portal to serve
the 1971-2000, 800 meter resolution PRISM dataset for BC.
'''

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, RasterMetadata
from pdp_util.ensemble_members import EnsembleMemberLister
import re

from pdp.minify import wrap_mini
from pdp.portals import updateConfig, raster_conf

ensemble_name = 'bc_prism_devel'
url_base = 'bc_prism_devel'


class PrismEnsembleLister(EnsembleMemberLister):
    def describe_time_set(self, unique_id):
        monthly = unique_id.find("mon") != -1
        climatology = unique_id.find("Clim") != -1
        date_finder = re.match(r'.*_(\d+)-(\d+).*', unique_id)

        return "{} {} {}-{}".format("Monthly " if monthly else "",
                                    "Climatological Averages " if climatology
                                    else "Timeseries ",
                                    date_finder.group(1)[0:4],
                                    date_finder.group(2)[0:4])

    def list_stuff(self, ensemble):
        for dfv in ensemble.data_file_variables:
            yield self.describe_time_set(dfv.file.unique_id),\
                dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')


def data_server(config, ensemble_name):
    dsn = config['dsn']
    conf = raster_conf(dsn, config, ensemble_name)
    data_server = wrap_auth(RasterServer(dsn, conf))
    return data_server


def portal(config):
    dsn = config['dsn']
    portal_config = {
        'title': 'High-Resolution PRISM Data',
        'ensemble_name': ensemble_name,
        'js_files': wrap_mini([
            'js/prism_demo_map.js',
            'js/prism_demo_controls.js',
            'js/prism_demo_app.js'],
            basename=url_base, debug=(not config['js_min']))
    }

    portal_config = updateConfig(config, portal_config)
    map_app = wrap_auth(MapApp(**portal_config), required=False)

    conf = raster_conf(dsn, config, ensemble_name)
    catalog_server = RasterCatalog(dsn, conf)  # No Auth

    menu = PrismEnsembleLister(dsn)

    metadata = RasterMetadata(dsn)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        ('^/catalog/.*$', catalog_server),
        ('^/menu.json.*$', menu),
        ('^/metadata.json.*$', metadata),
    ])
