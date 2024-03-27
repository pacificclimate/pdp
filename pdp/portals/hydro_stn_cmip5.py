'''This portal serves routed streamflow data for the Peace, Fraser, and
Columbia watersheds. The data is CSV files; users select a station and
receives a single CSV file containing all timestamps for all runs
(model / scenario) available for that station. It serves every file in
a directory specified by the resource yaml.

Metadata about these files, such as station locations and name,
is not served by this portal; the front end retrieves it from
a separate CSV.

This portal uses the hydro_stn_app frontend.'''

from pkg_resources import resource_filename

from werkzeug import DispatcherMiddleware

from pdp_util.map import MapApp
from pydap.wsgi.app import DapServer

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

__all__ = ['url_base', 'mk_frontend', 'mk_backend']

url_base = '/hydro_stn_cmip5'


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


def mk_backend(config):
    data_server = HydroStationDataServer(
            resource_filename('pdp', 'resources/hydro_stn_cmip5.yaml'),
            config['data_root'].rstrip('/') + '/'
    )
    return data_server


def mk_frontend(config):
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

    return DispatcherMiddleware(map_app, {'/map': map_app})
