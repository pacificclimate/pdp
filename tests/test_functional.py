from datetime import datetime, timedelta
from urllib import urlencode
from tempfile import TemporaryFile, NamedTemporaryFile
from zipfile import ZipFile
import csv
import json
import os
from itertools import izip
from pkg_resources import resource_filename
import static

import pytest
from webob.request import Request
from PIL import Image
import xlrd
import netCDF4
import numpy as np
from numpy.testing import assert_almost_equal
from bs4 import BeautifulSoup


@pytest.mark.parametrize('url', [
    '/css/main.css', '/images/banner.png', '/robots.txt'
])
def test_static(url):
    static_app = static.Cling(resource_filename('pdp', 'static'))
    req = Request.blank(url)
    resp = req.get_response(static_app)
    assert resp.status == '200 OK'


@pytest.mark.local_only
@pytest.mark.crmpdb
@pytest.mark.parametrize('url', [
    '/css/main.css', '/images/banner.png', '/robots.txt'
])
def test_static_full(pcic_data_portal, url):
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'


@pytest.mark.crmpdb
@pytest.mark.parametrize('url', ['/'])
def test_no_404s(pcic_data_portal, url):
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'


@pytest.mark.crmpdb
@pytest.mark.parametrize(('url', 'title', 'body_strings'), [
    ('/data/pcds/lister/', 'PCDS Data',
     ["Climatological calculations", "raw/"]),
    ('/data/pcds/lister/raw/', "Participating CRMP Networks",
     ["FLNRO-WMB/", "Environment Canada (Canadian Daily Climate Data 2007)"]),
    ('/data/pcds/lister/raw/AGRI/',
     "Stations for network AGRI", ["de107/", "Deep Creek"]),
])
def test_climo_index(
        pcic_data_portal, url, title, body_strings):
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'text/html'
    assert resp.content_length < 0

    soup = BeautifulSoup(resp.body, "html.parser")

    assert title in soup.title.string
    for string in body_strings:
        assert string in resp.body


@pytest.mark.crmpdb
def test_unsupported_extension(pcic_data_portal):
    req = Request.blank('/data/pcds/agg/?data-format=foo')
    req.method = 'POST'
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '400 Bad Request'


@pytest.mark.crmpdb
@pytest.mark.parametrize('ext', ['ascii', 'csv'])
def test_ascii_response(pcic_data_portal, ext):
    url = '/data/pcds/lister/climo/EC/1010066.csql.{0}?'\
          'station_observations.Precip_Climatology,station_observations.time'\
          .format(ext)
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    x = '''station_observations
Precip_Climatology, time
127.128, 2000-01-31 23:59:59
91.2249, 2000-02-29 23:59:59
77.3313, 2000-03-31 23:59:59
46.2816, 2000-04-30 23:59:59
39.6803, 2000-05-31 23:59:59
33.1902, 2000-06-30 23:59:59
22.3557, 2000-07-31 23:59:59
22.448, 2000-08-31 23:59:59
38.5025, 2000-09-30 23:59:59
72.3281, 2000-10-31 23:59:59
144.159, 2000-11-30 23:59:59
121.008, 2000-12-31 23:59:59
'''
    assert resp.body == x


@pytest.mark.crmpdb
def test_xls_response(pcic_data_portal):
    url = '/data/pcds/lister/climo/EC/1010066.csql.xls?'
    'station_observations.Precip_Climatology,station_observations.time'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    wb = xlrd.open_workbook(file_contents=resp.body)
    assert wb.sheet_names() == [u'Global attributes', u'station_observations']
    attributes, obs = wb.sheets()
    # Check the data in the station_observations sheet
    cells = ['Precip_Climatology', 127.128, 91.2249, 77.3313, 46.2816, 39.6803,
             33.1902, 22.3557, 22.448, 38.5025, 72.3281, 144.159, 121.008]
    for i, val in enumerate(cells):
        assert obs.cell_value(i, 0) == val
    # Check a few of the global attributes
    assert attributes.cell_value(5, 2) == '-123.283333'  # longitude
    assert attributes.cell_value(2, 2) == '1010066'  # station_id
    assert attributes.cell_value(8, 2) == 'ACTIVE PASS'  # station name


@pytest.mark.crmpdb
def test_nc_response(pcic_data_portal):
    url = '/data/pcds/lister/climo/EC/1010066.csql.nc?'
    'station_observations.Precip_Climatology,station_observations.time'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'

    f = NamedTemporaryFile(suffix='.nc', delete=False)
    for block in resp.app_iter:
        f.write(block)
    f.close()

    nc = netCDF4.Dataset(f.name)
    assert_almost_equal(nc.longitude, np.array(-123.28333), 4)
    assert nc.station_id == '1010066'
    assert nc.station_name == 'ACTIVE PASS'  # station name
    var = nc.variables['Precip_Climatology']
    assert var.cell_method == 't: sum within months t: mean over years'
    prcp = [127.128, 91.2249, 77.3313, 46.2816, 39.6803, 33.1902, 22.3557,
            22.448, 38.5025, 72.3281, 144.159, 121.008]
    for actual, expected in zip(var, prcp):
        assert actual == expected
    assert nc.variables['time'].type == 'Float64'
    nc.close()
    os.remove(f.name)


@pytest.mark.slow
@pytest.mark.crmpdb
def test_nc_response_with_null_values(pcic_data_portal):
    req = Request.blank('/data/pcds/lister/raw/BCH/AKI.rsql.nc')
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'


@pytest.mark.slow
@pytest.mark.crmpdb
def test_clip_to_date_one(pcic_data_portal):
    base_url = '/data/pcds/agg/?'
    sdate = datetime(2007, 01, 01)
    params = {'from-date': sdate.strftime('%Y/%m/%d'),
              'network-name': 'RTA', 'data-format': 'csv',
              'cliptodate': 'cliptodate',
              }
    req = Request.blank(base_url + urlencode(params))

    resp = req.get_response(pcic_data_portal)
    print resp.status
    assert resp.status == '200 OK'
    t = TemporaryFile()
    t.write(resp.body)
    z = ZipFile(t, 'r')
    assert 'RTA/1B08P.csv' in z.namelist()
    f = z.open("RTA/1B08P.csv")
    [f.readline() for _ in range(10)]
    # Read through the file and ensure the no data outside of the date
    # range was returned
    reader = csv.reader(f)
    for row in reader:
        if len(row) > 0:
            d = datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S')
            assert d >= sdate
    # Check values on the first 5 just to make sure
    expected = ['2007-01-09 00:00:00',
                '2007-01-10 00:00:00',
                '2007-01-11 00:00:00',
                '2007-01-12 00:00:00',
                '2007-01-13 00:00:00']
    for exp, actual in izip(expected, reader):
        assert exp[0] == actual

# FIXME: These next two aren't actually going to work w/o firing up an
# http server with reverse proxy

# from pdp import global_config
# @pytest.mark.parametrize('url',
# ['/' + global_config['ol_path'], '/' + global_config['proj_path']])
# def notest_can_access_static_resources(url, pcic_data_portal):
#     req = Request.blank(url)
#     resp = req.get_response(pcic_data_portal)
#     assert resp.status == '200 OK'

# @pytest.mark.parametrize('url',
# [global_config['geoserver_url'], global_config['ncwms_url']])
# def notest_can_access_external_resources(url, pcic_data_portal):
#     req = Request.blank(url)
#     resp = req.get_response(pcic_data_portal)
#     assert resp.status == '200 OK'


@pytest.mark.slow
@pytest.mark.crmpdb
@pytest.mark.parametrize('polygon', ['single station polygon',
                                     'multiple station polygon',
                                     'multiple polygons',
                                     'station EC 1025230',
                                     'station without observations polygon',
                                     'network without observations polygon'
                                     ])
def test_input_polygon_download_zipfile(pcic_data_portal, polygon):
    polygons = {
        'single station polygon':
        'MULTIPOLYGON(('
        '(-128.59910830928055 53.852860003953495,'
        '-128.45182033352623 53.86465328654807,'
        '-128.4562364026459 53.79618867900996,'
        '-128.59910830928055 53.852860003953495)))',
        'multiple station polygon':
        'MULTIPOLYGON(('
        '(-122.16988794027921 54.61618496834933,'
        '-122.12395804699314 54.61753974917094,'
        '-122.12601061930596 54.59023544661601,'
        '-122.16988794027921 54.61618496834933)))',
        'multiple polygons':
        'MULTIPOLYGON(('
        '(-121.89643424564886 54.20043741333826,'
        '-122.13176870283458 54.14845194258505,'
        '-122.1226369471675 54.01876407450885,'
        '-121.75836848952896 54.048830061202494,'
        '-121.89643424564886 54.20043741333826)),'
        '((-121.23964475389124 54.0095741960868,'
        '-121.45248834584457 53.967985385684926,'
        '-121.43980080067858 53.81312824978667,'
        '-121.108695973217 53.82251331340121,'
        '-121.23964475389124 54.0095741960868)))',
        'station EC 1025230':
        'MULTIPOLYGON(('
        '(-125.29637443283997 49.75425334879682,'
        '-125.27276223016982 49.757216316386696,'
        '-125.27059060328506 49.742548670551834,'
        '-125.29276284376195 49.73895329426124,'
        '-125.29637443283997 49.75425334879682)))',
        'station without observations polygon':
        'MULTIPOLYGON(('
        '(-123.28294974546985 48.53765964184428,'
        '-123.22831848366447 48.573754711908165,'
        '-123.20548795617668 48.51564288151938,'
        '-123.28294974546985 48.53765964184428)))',
        'network without observations polygon':
        'MULTIPOLYGON(('
        '(-122.84250052310462 49.33095465473638,'
        '-122.90005834526038 49.297649140301004,'
        '-122.86157366135 49.24657317992617,'
        '-122.76249620948452 49.219908575081675,'
        '-122.66148902126935 49.24806074593272,'
        '-122.70891368322285 49.30448396541877,'
        '-122.84250052310462 49.33095465473638)))'
    }

    base_url = '/data/pcds/agg/?'
    params = {'from-date': 'YYYY/MM/DD',
              'to-date': 'YYYY/MM/DD',
              'input-polygon': polygons[polygon],
              'data-format': 'ascii',
              'download-timeseries': 'Timeseries'
              }

    req = Request.blank(base_url + urlencode(params))

    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'

    t = TemporaryFile()
    t.write(resp.body)
    z = ZipFile(t, 'r')
    assert z.testzip() is None


@pytest.mark.crmpdb
@pytest.mark.bulk_data
def test_climatology_bounds(pcic_data_portal):
    url = '/data/bc_prism/pr_mClimMean_PRISM_historical_19710101-20001231'\
          '.nc.nc?climatology_bnds&'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)

    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'

    f = NamedTemporaryFile(suffix='.nc', delete=False)
    for block in resp.app_iter:
        f.write(block)
    f.close()

    nc = netCDF4.Dataset(f.name)

    assert 'climatology_bnds' in nc.variables

    assert_almost_equal(nc.variables['climatology_bnds'][:],
                        np.array([[0.,  10988.],
                                  [31.,  11017.],
                                  [59.,  11048.],
                                  [90.,  11078.],
                                  [120.,  11109.],
                                  [151.,  11139.],
                                  [181.,  11170.],
                                  [212.,  11201.],
                                  [243.,  11231.],
                                  [273.,  11262.],
                                  [304.,  11292.],
                                  [334.,  11323.]], dtype=np.float32))
    nc.close()
    os.remove(f.name)


@pytest.mark.crmpdb
@pytest.mark.parametrize(('portal', 'ensemble'), [
        ('bc_prism', 'bc_prism'),
        ('downscaled_gcms', 'bccaq_version_2'),
        ('downscaled_cmip6', 'bccaq2_cmip6'),
        ('downscaled_canesm5', 'bccaq2_canesm5'),
        ('downscaled_cmip6_multi', 'mbcn_cmip6'),
        ('downscaled_canesm5_multi', 'mbcn_canesm5'),
        ('hydro_model_out', 'vic_gen2'),
        ('gridded_observations', 'gridded-obs-met-data')
    ])
def test_menu_json(pcic_data_portal, portal, ensemble):
    url = '/{}/menu.json?ensemble_name={}'.format(portal, ensemble)
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/json'
    data = json.loads(resp.body)
    assert len(data) > 0


@pytest.mark.slow
@pytest.mark.bulk_data
def test_hydro_stn_data_catalog(pcic_data_portal):
    url = '/data/hydro_stn_cmip5/catalog.json'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/json'
    assert '/hydro_stn/LARMA.csv' in resp.body
    data = json.loads(resp.body)
    assert len(data) > 0


@pytest.mark.slow
@pytest.mark.bulk_data
def test_hydro_stn_data_csv_csv(pcic_data_portal):
    url = '/data/hydro_stn_cmip5/RVC.csv.csv'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'text/plain'
    for line in resp.app_iter:
        expected = '1955/01/01, 198.560531616, 150.387130737, 192.676101685, '\
                   '219.072235107, 149.236831665, 187.566864014, 145.519927979, '\
                   '150.252120972, 192.810394287, 219.105148315, 149.223098755, '\
                   '187.070281982, 145.611068726'
        if line.strip() == expected:
            assert True
            return

    assert False, "Data line for 1955/1/1 does not exist"


@pytest.mark.slow
@pytest.mark.bulk_data
def test_hydro_stn_data_csv_selection_projection(pcic_data_portal):
    url = '/data/hydro_stn_cmip5/RVC.csv.csv?'\
          'sequence.CCSM4_rcp45_r2i1p1&sequence.CCSM4_rcp45_r2i1p1>100'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'text/plain'
    assert resp.body.startswith('''sequence
CCSM4_rcp45_r2i1p1
135.944763184
188.809707642
215.548400879
235.553085327
253.983230591
268.594268799
277.489013672
281.091888428
281.099517822
279.152954102
276.435028076''')


@pytest.mark.bulk_data
def test_hydro_model_out_catalog(pcic_data_portal):
    url = '/hydro_model_out/catalog/'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/json'
    assert 'hydro_model_out/allwsbc.HadGEM2-ES_rcp85_r1i1p1.1945to2099.'\
        'SNOW_MELT.nc' in resp.body
    data = json.loads(resp.body)
    assert len(data) > 0


@pytest.mark.bulk_data
@pytest.mark.parametrize('url', [
    '{}HadGEM2-ES_rcp85_r1i1p1.1945to2099.SNOW_MELT.nc.nc?SNOW_MELT[0:1][0:1][0:1]&',
    '{}CCSM4_rcp45_r2i1p1.1945to2099.PET_NATVEG.nc.nc?PET_NATVEG[0:1][0:1][0:1]&',
    '{}CNRM-CM5_rcp85_r1i1p1.1945to2099.TRANSP_VEG.nc.nc?TRANSP_VEG[0:1][0:1][0:1]&',
    '{}TPS_gridded_obs_init.1945to2099.SOIL_MOIST_TOT.nc.nc?SOIL_MOIST_TOT[0:1][0:1][0:1]&'
])
def test_hydro_model_out_allwsbc(pcic_data_portal, url):
    base = '/data/hydro_model_out/allwsbc.'
    req = Request.blank(url.format(base))
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'


@pytest.mark.slow
@pytest.mark.bulk_data
@pytest.mark.parametrize(('projection', 'length'), [
    ('[][][]', 12),
    ('[1][][]', 1),  # single index
    ('[0:2:10][][]', 6),  # start, step, last
    ('[5:10][][]', 6),  # start, last
    ('[4:][][]', 8),  # start to the end
    ('[4:2:][][]', 4)  # start, step
])
def test_empty_hyperslabs(pcic_data_portal, projection, length):
    varname = 'pr'
    url = '/data/bc_prism/pr_mClimMean_PRISM_historical_19710101-20001231'\
          '.nc.nc?{}{}'.format(varname, projection)
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'

    f = NamedTemporaryFile(suffix='.nc', delete=False)
    for block in resp.app_iter:
        f.write(block)
    f.close()

    nc = netCDF4.Dataset(f.name)
    assert varname in nc.variables
    assert nc.variables[varname].shape[0] == length

    nc.close()
    os.remove(f.name)


@pytest.mark.slow
@pytest.mark.bulk_data
@pytest.mark.parametrize("file,expected_mean",
                         [('tasmax_day_BCCAQv2+ANUSPLIN300_IPSL-CM5A-MR_'
                           'historical+rcp26_r1i1p1_19500101-21001231.nc.nc?'
                           'tasmax[5000:5200][132:132][334:334]&',
                           4.38851693),
                          ('tasmax_day_BCCAQv2+ANUSPLIN300_NorESM1-ME_'
                           'historical+rcp85_r1i1p1_19500101-21001231.nc.nc?'
                           'tasmax[55021:55021][158:265][156:334]&',
                           11.69472020)])
def test_nonrecord_variables(pcic_data_portal, file, expected_mean):

    url = "/data/downscaled_gcms/{}".format(file)
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'

    f = NamedTemporaryFile(suffix='.nc', delete=False)
    for block in resp.app_iter:
        f.write(block)
    f.close()

    nc = netCDF4.Dataset(f.name)

    assert 'tasmax' in nc.variables
    mean = np.mean(nc.variables['tasmax'][:])
    assert_almost_equal(mean, expected_mean)

    nc.close()
    os.remove(f.name)
