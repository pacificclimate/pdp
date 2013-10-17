import os
from tempfile import NamedTemporaryFile

from webob.request import Request
import pytest

import netCDF4

def test_can_instantiate_raster_pydap(raster_pydap):
    assert isinstance(raster_pydap, object)

def test_hdf5_to_netcdf(raster_pydap, authorized_session_id):
    req = Request.blank('/pr+tasmax+tasmin_day_BCSD+ANUSPLIN300+CCSM4_historical+rcp26_r2i1p1_19500101-21001231.h5.nc?pr[0:1:1][116:167][84:144]&')
    req.cookies['beaker.session.id'] = authorized_session_id
    resp = req.get_response(raster_pydap)

    assert resp.status == '200 OK'
    assert resp.content_type == 'application/x-netcdf'
    
    f = NamedTemporaryFile(suffix='.nc')
    for block in resp.app_iter:
        f.write(block)

    # for now, just check that netCDF4 can open it and that's good enough
    nc = netCDF4.Dataset(f.name)
    nc.close()
    os.remove(f.name)

def test_prism_response(pcic_data_portal, authorized_session_id):
    req = Request.blank('/bc_prism_demo/data/bc_tmax_review_07.nc.html')
    req.cookies['beaker.session.id'] = authorized_session_id
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type == 'text/html'
    
def test_dds_response(pcic_data_portal, authorized_session_id):
    req = Request.blank('/bcsd_downscale_canada/data/pr+tasmax+tasmin_day_BCSD+ANUSPLIN300+CCSM4_historical+rcp26_r2i1p1_19500101-21001231.h5.dds')
    req.cookies['beaker.session.id'] = authorized_session_id
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert resp.content_type.startswith('text/plain')
    body = ''.join([ x for x in resp.app_iter ])
    assert body == '''Dataset {
    Float64 lat[lat = 510];
    Float64 lon[lon = 1068];
    Grid {
        Array:
            Int16 pr[time = 55115][lat = 510][lon = 1068];
        Maps:
            Float64 time[time = 55115];
            Float64 lat[lat = 510];
            Float64 lon[lon = 1068];
    } pr;
    Grid {
        Array:
            Int16 tasmax[time = 55115][lat = 510][lon = 1068];
        Maps:
            Float64 time[time = 55115];
            Float64 lat[lat = 510];
            Float64 lon[lon = 1068];
    } tasmax;
    Grid {
        Array:
            Int16 tasmin[time = 55115][lat = 510][lon = 1068];
        Maps:
            Float64 time[time = 55115];
            Float64 lat[lat = 510];
            Float64 lon[lon = 1068];
    } tasmin;
    Float64 time[time = 55115];
} pr%2Btasmax%2Btasmin_day_CI%2BANUSPLIN300%2BCanESM2_historical%2Brcp45_r1i1p1_19500101-21001231%2Eh5;
'''
