import os
from tempfile import NamedTemporaryFile

from webob.request import Request
import pytest

import netCDF4

from pdp_util import session_scope
from modelmeta import DataFile


def is_valid_orca_url(url_id, resp, nc_request=True):
    orca_base = os.getenv("ORCA_ROOT")
    with session_scope(os.getenv("DSN")) as sesh:
        q = sesh.query(DataFile.filename).filter(DataFile.filename.contains(url_id))
    storage_path = q.one()[0].strip("/")

    assert resp.status == "301 Moved Permanently"
    assert resp.content_type == "text/plain"
    if nc_request:
        assert all(dim in resp.location for dim in ["time", "lat", "lon"])
    assert orca_base in resp.location
    assert storage_path in resp.location
    return True


def test_can_instantiate_raster_pydap(raster_pydap):
    assert isinstance(raster_pydap, object)


@pytest.mark.slow
@pytest.mark.bulk_data
def test_hdf5_to_netcdf(pcic_data_portal):
    url = '/data/downscaled_gcms/pr_day_BCCAQv2+'\
          'ANUSPLIN300_CCSM4_historical+rcp26_r2i1p1_19500101-'\
          '21001231.nc.nc?pr[0:1:1][116:167][84:144]&'
    req = Request.blank(url)
        
#    https://docker-dev03.pcic.uvic.ca/twitcher/ows/proxy/thredds/dodsC/datasets
#    /downscaled_gcms_archive/pr+tasmax+tasmin_day_BCCAQ+
#    ANUSPLIN300+CCSM4_historical+rcp26_r2i1p1_19500101-
#    21001231.nc.html
    print("req is")
    print(req)
    resp = req.get_response(pcic_data_portal)
    print("resp in test function is")
    print(resp.body)

    url_id = os.path.basename(url).split(".nc")[0]
    assert is_valid_orca_url(url_id, resp)

    orca_req = Request.blank(resp.location)
    orca_resp = orca_req.get_response()
    assert orca_resp.status == '200 OK'
    assert orca_resp.content_type == 'application/x-netcdf'

    f = NamedTemporaryFile(suffix='.nc')
    for block in orca_resp.app_iter:
        f.write(block)

    # for now, just check that netCDF4 can open it and that's good enough
    nc = netCDF4.Dataset(f.name, 'r')
    nc.close()
    os.remove(f.name)


@pytest.mark.bulk_data
def test_prism_response(pcic_data_portal):
    url = '/data/bc_prism/pr_mClimMean_PRISM_historical_19710101-20001231'\
          '.nc.html'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    url_id = os.path.basename(url).split(".html")[0]
    assert is_valid_orca_url(url_id, resp, nc_request=False)

    orca_req = Request.blank(resp.location)
    orca_resp = orca_req.get_response()
    assert orca_resp.status == '200 OK'
    assert orca_resp.content_type == 'text/html'


@pytest.mark.bulk_data
def test_dds_response(pcic_data_portal):
    url = '/data/downscaled_gcms/pr_day_BCCAQv2+'\
          'ANUSPLIN300_CCSM4_historical+rcp26_r2i1p1_19500101-'\
          '21001231.nc.dds'
    req = Request.blank(url)
    resp = req.get_response(pcic_data_portal)
    url_id = os.path.basename(url).split(".dds")[0]
    assert is_valid_orca_url(url_id, resp, nc_request=False)

    orca_req = Request.blank(resp.location)
    orca_resp = orca_req.get_response()
    assert orca_resp.status == '200 OK'
    assert orca_resp.content_type.startswith('application/octet-stream')
    body = ''.join([x.decode("utf-8") for x in orca_resp.app_iter])
    assert body == '''Dataset {
    Float64 lon[lon = 1068];
    Float64 lat[lat = 510];
    Float64 time[time = 55115];
    Grid {
     ARRAY:
        Int16 pr[time = 55115][lat = 510][lon = 1068];
     MAPS:
        Float64 time[time = 55115];
        Float64 lat[lat = 510];
        Float64 lon[lon = 1068];
    } pr;
} datasets/storage/data/climate/downscale/BCCAQ2/bccaqv2_with_metadata/pr_day_BCCAQv2%2bANUSPLIN300_CCSM4_historical%2brcp26_r2i1p1_19500101-21001231.nc;
'''  # noqa: E501
