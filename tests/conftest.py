# Integration tests for the the full data portal web application

import sys
from os.path import dirname
from tempfile import mkdtemp
from shutil import rmtree
import random
import cPickle
import re

import webob
import pytest
from webob.request import Request

@pytest.fixture(scope="function")
def raster_pydap():
    from pdp import servers
    return servers['canada_map']

@pytest.fixture(scope="module")
def pcic_data_portal():
    from pdp import main
    return main

@pytest.fixture(scope="module")
def pcds_map_app():
    from pdp import pcds_map
    return pcds_map

@pytest.fixture(scope="module")
def check_auth_app():
    from pdp import check_auth
    return check_auth

@pytest.fixture(scope="module")
def authorized_session_id(check_auth_app):
    # FIXME: I shouldn't have to do this, but the store doesn't get initialized until the first request
    oid_app = check_auth_app.wrap_app
    try:
        oid_app({}, None)
    except:
        pass
    
    assoc_handle = 'handle'
    saved_assoc = 'saved'
    claimed_id = 'test_id'
    oid_app.store.add_association(claimed_id, None, saved_assoc)
    oid_app.store.add_association(assoc_handle, None, saved_assoc)

    session = str(random.getrandbits(40))
    oid_app.store.start_login(session, cPickle.dumps((claimed_id, assoc_handle)))

    # Simulate the return from the openid provider
    req = Request.blank('/?openid_return='+session+'&openid.signed=yes')
    resp = req.get_response(check_auth_app)
    assert resp.status == '200 OK'

    m = re.search(r'beaker.session.id=([a-f0-9]+);', resp.headers['Set-cookie'])
    return m.group(1)

