from pkg_resources import resource_filename

from pdp.dispatch import PathDispatcher
from pdp_util.map import MapApp
from pydap.wsgi.app import DapServer

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

url_base = '/hydro_stn'


class HydroStationDataServer(DapServer):
    '''WSGI app which is a subclass of PyDap's DapServer that directly
    configures the app's root_url
    '''

    def __init__(self, filepath, root_url):
        self.root_url = root_url
        return super(HydroStationDataServer, self).__init__(filepath)

    @property
    def config(self):
        super(HydroStationDataServer, self).config
        self._config['root_url'] = self.root_url
        return self._config


def data_server(global_config):
    data_server = HydroStationDataServer(
            resource_filename('pdp', 'portals/hydro_stn.yaml'),
            global_config['data_root'].rstrip('/') + '/'
    )
    return data_server


def portal(config):
    hydro_stn_config = {
        'title': 'Modelled Streamflow Data',
        'js_files':
        wrap_mini([
            'js/jquery.csv-0.71.js',
            'js/hydro_stn_download.js',
            'js/hydro_stn_map.js',
            'js/hydro_stn_controls.js',
            'js/hydro_stn_app.js'],
            basename=url_base, debug=(not config['js_min'])
        )
    }

    config = updateConfig(config, hydro_stn_config)
    map_app = MapApp(**config)

    return PathDispatcher([
        ('^/map/?.*$', map_app),
    ])
