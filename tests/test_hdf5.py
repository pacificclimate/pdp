import os
from tempfile import NamedTemporaryFile

from webob.request import Request
import pytest

import netCDF4

def test_can_instantiate_raster_pydap(raster_pydap):
    assert isinstance(raster_pydap, object)

def test_hdf5_to_netcdf(raster_pydap):
    req = Request.blank('/pr+tasmax+tasmin_day_CI+ANUSPLIN300+CanESM2_historical+rcp45_r1i1p1_19500101-21001231.h5.nc?pr[0:1:1][116:167][84:144]&')
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
