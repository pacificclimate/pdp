# Integration tests for the the full data portal web application
import json
import re
from urlparse import urlparse
import logging

import pytest
from webob.request import Request

logger = logging.getLogger(__name__)


@pytest.fixture(scope="function")
def raster_pydap():
    from pdp.portals.downscale_archive import mk_backend
    return mk_backend


@pytest.fixture(scope="function")
def prism_portal():
    from pdp.portals.bc_prism import mk_backend
    return mk_backend


@pytest.fixture(scope="module")
def pcic_data_portal():
    from pdp.main import initialize_dev_server
    from pdp import get_config
    return initialize_dev_server(get_config(), False)


@pytest.fixture(scope="module")
def pcds_map_app():
    from pdp.portals.pcds import mk_backend
    return mk_backend


def detect_variable_from_das(url, app):
    req = Request.blank(url + '.das')
    try:
        resp = req.get_response(app)
    except Exception:
        return None
    s = resp.body
    match = re.search('(tasmin|tasmax|pr) \{', s, re.MULTILINE)
    if match:
        return match.group(1)
    else:
        return None


def pytest_generate_tests(metafunc):
    if 'hammer_url' in metafunc.fixturenames:

        urls = []
        from pdp.main import initialize_dev_server
        from pdp import get_config
        pcic_data_portal = initialize_dev_server(get_config(), False)

        # Query the catalogs for both downscaled datasets and construct
        # a subset test URL for each dataset
        for ensemble in ('downscaled_gcms_archive', 'downscaled_gcms'):
            url = '/{}/catalog/catalog.json'.format(ensemble)
            req = Request.blank(url)
            resp = req.get_response(pcic_data_portal)
            assert resp.status == '200 OK'
            catalog = json.loads(resp.body)

            slice = '[2:8][256:256][256:256]'

            for url in catalog.values():
                varname = detect_variable_from_das(url, pcic_data_portal)
                if not varname:
                    logger.warning("Could not find a variable at dataset %s",
                                   url)
                    continue
                pieces = urlparse(url)
                full_url = "{}.nc?{}{}".format(pieces.path, varname, slice)
                urls.append(full_url)

            # Other miscellaneous tests
            urls = urls + [
                # testing different slices - bccaq2
                '/data/downscaled_gcms/tasmin_day_BCCAQv2+ANUSPLIN300_CCSM4'
                '_historical+rcp45_r2i1p1_19500101-21001231.nc.nc?'
                'tasmin[2:7][32:32][739:739]',
                '/data/downscaled_gcms/tasmin_day_BCCAQv2+ANUSPLIN300_CCSM4'
                '_historical+rcp45_r2i1p1_19500101-21001231.nc.nc?'
                'tasmin[2:1000][32:32][739:739]',
                # testing different slices - bccaq1
                '/data/downscaled_gcms_archive/pr+tasmax+tasmin_day_BCSD'
                '+ANUSPLIN300+CanESM2_historical+rcp26_r1i1p1_19500101-'
                '21001231.nc.nc?tasmax[0:20][154:170][903:919]&',
                '/data/downscaled_gcms_archive/pr+tasmax+tasmin_day_BCSD'
                '+ANUSPLIN300+CanESM2_historical+rcp26_r1i1p1_19500101-'
                '21001231.nc.nc?tasmax[0:10][0:100][0:100]'
            ]

        metafunc.parametrize("hammer_url", urls, indirect=True)


@pytest.fixture
def hammer_url(request):
    return request.param
