# Integration tests for the the full data portal web application

import sys
from os.path import dirname
from tempfile import mkdtemp
from shutil import rmtree

import webob
import pytest

@pytest.fixture(scope="function")
def raster_pydap():
    from pdp import raster_server
    return raster_server

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
