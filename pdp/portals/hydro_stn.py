from pkg_resources import resource_filename

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher
from pdp_util import session_scope
from pdp_util.map import MapApp
from pdp_util.raster import RasterServer, RasterCatalog, db_raster_configurator
from pydap.wsgi.app import DapServer

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

class HydroStationDataServer(DapServer):
    '''WSGI app which is a subclass of PyDap's DapServer that directly configures the app's root_url'''
    def __init__(self, filepath, root_url):
        self.root_url = root_url
        return super(HydroStationDataServer, self).__init__(filepath)

    @property
    def config(self):
        cfg = super(HydroStationDataServer, self).config
        self._config['root_url'] = self.root_url
        return self._config

def portal(global_config):

    hydro_stn_config = {
        'title': 'Modelled Streamflow Data',
        'js_files' :
        wrap_mini([
                'js/jquery.csv-0.71.js',
                'js/hydro_stn_download.js',
                'js/hydro_stn_map.js',
                'js/hydro_stn_controls.js',
                'js/hydro_stn_app.js'],
                  basename='hydro_stn', debug=True
                  )
        }
    config = updateConfig(global_config, hydro_stn_config)

    map_app = wrap_auth(MapApp(**config), required=False)

    data_server = HydroStationDataServer(resource_filename('pdp', 'portals/hydro_stn.yaml'), global_config['app_root'])
    # data_server = wrap_auth(HydroStationDataServer(resource_filename('pdp', 'portals/hydro_stn.yaml'), global_config['app_root']))

    return PathDispatcher([
        ('^/map/?.*$', map_app),
        # Catalog can be found at /data/catalog.json
        ('^/data/.*$', data_server),
    ])

