# Integration tests for the the full data portal web application

from tempfile import mkdtemp
import random
import cPickle
import re

import py
import pytest
from webob.request import Request
from beaker.middleware import SessionMiddleware


@pytest.fixture(scope="module")
def session_dir(request):
    '''For testing we should manage the session directory ourselves so that:
       a) we don't stomp on existing session directories
       b) we don't require run time configuration
       c) we ensure that everything gets properly cleaned up after the test run
    '''
    dirname = py.path.local(mkdtemp())
    request.addfinalizer(lambda: dirname.remove(rec=1, ignore_errors=True))
    return str(dirname)


@pytest.fixture(scope="function")
def raster_pydap():
    from pdp.portals.bcsd_downscale_canada import mk_backend
    return mk_backend


@pytest.fixture(scope="function")
def prism_portal():
    from pdp.portals.bc_prism import mk_backend
    return mk_backend


@pytest.fixture(scope="module")
def pcic_data_portal(session_dir):
    from pdp.main import initialize_dev_server
    from pdp import get_config
    return initialize_dev_server(get_config(), False)





@pytest.fixture(scope="module")
def pcds_map_app():
    from pdp.portals.pcds import mk_backend
    return mk_backend
