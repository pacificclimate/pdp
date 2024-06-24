'''This portal serves routed streamflow data for the Peace, Fraser, and
Columbia watersheds. The data is CSV files; users select a station and
receives a single CSV file containing all timestamps for all runs
(model / scenario) available for that station. It serves every file in
a directory specified by the resource yaml.

Metadata about these files, such as station locations and name,
is not served by this portal; the front end retrieves it from
a separate CSV.

This portal uses the hydro_stn_app frontend.'''

import os
from pkg_resources import resource_filename

from werkzeug.middleware.dispatcher import DispatcherMiddleware

from pdp_util.map import MapApp

from pdp.minify import wrap_mini
from pdp.portals import updateConfig

from simplejson import dumps
from webob.request import Request
from webob.response import Response

__all__ = ['url_base', 'mk_frontend', 'mk_backend']

url_base = '/hydro_stn_cmip5'


class HydroStationDataServer(object):
    '''WSGI app to create URLs that redirect to the ORCA application to obtain data
    from THREDDS server
    '''

    def __init__(self, config):
        self._config = config

    @property
    def config(self):
        return self._config

    def __call__(self, environ, start_response):
        storage_root = '/storage/data/projects/dataportal/data/hydrology/vic_cmip5/merged'
        req = Request(environ)
        if req.path_info == '/catalog.json':
            urls = [self.config['data_root'] + '/hydro_stn/' + csv for csv in os.listdir(storage_root)]
            res = Response(
                body=dumps(urls, indent=4),
                content_type='application/json',
                charset='utf-8',
            )
            return res(environ, start_response)
        else:
            thredds_root = self.config['thredds_root'].replace('dodsC', 'fileServer') # Use HTTP instead of OPeNDAP for CSV files
            url = build_orca_url(self.config['orca_root'], thredds_root, storage_root, req)
            return Response(status_code=301, location=url)

def build_orca_url(orca_root, thredds_root, storage_root, req):
    filepath = storage_root + req.path_info
    if req.query_string == '':
        return f'{orca_root}/?filepath={filepath}&thredds_base={thredds_root}&outfile={req.path_info.strip("/.")}'
    else:
        return f'{orca_root}/?filepath={filepath}&thredds_base={thredds_root}&targets={req.query_string}&outfile={req.path_info.strip("/.")}'

def mk_backend(config):
    data_server = HydroStationDataServer(config)
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
