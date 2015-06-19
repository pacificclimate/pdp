# Integration tests for the the full data portal web application

import sys
from os.path import dirname
from tempfile import mkdtemp
from shutil import rmtree
import random
import cPickle
import re

import py
import webob
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
    from pdp.portals.bcsd_downscale_canada import portal
    return portal

@pytest.fixture(scope="function")
def prism_portal():
    from pdp.portals.bc_prism import portal
    return portal

@pytest.fixture(scope="module")
def pcic_data_portal(session_dir):
    from pdp.main import initialize_dev_server
    from pdp import get_config
    dev_server = initialize_dev_server(get_config(), False, False)
    return SessionMiddleware(dev_server, auto=1, data_dir=session_dir)

@pytest.fixture(scope="module")
def user_manager_fixture(session_dir):
    from pdp.auth import user_manager
    return SessionMiddleware(user_manager(), auto=1, data_dir=session_dir)


@pytest.fixture(scope="module")
def pcds_map_app():
    from pdp.portals.pcds import portal
    return portal

@pytest.fixture(scope="module")
def check_auth_app(session_dir):
    from pdp import wrap_auth
    from pdp_util.auth import check_authorized_return_email
    check_auth = wrap_auth(check_authorized_return_email, required=False)
    return SessionMiddleware(check_auth, auto=1, data_dir=session_dir)

@pytest.fixture(scope="module")
def authorized_session_id(user_manager_fixture):

    req = Request.blank('/login', POST='email:email@provider.com')
    req.body = 'email=fake_email@provider.com'

    resp = req.get_response(user_manager_fixture)
    assert resp.status == '200 OK'
    assert 'Set-cookie' in resp.headers
    return resp.json['session_id']
