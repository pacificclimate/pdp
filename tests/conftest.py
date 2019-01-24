# Integration tests for the the full data portal web application

import pytest


@pytest.fixture(scope="function")
def raster_pydap():
    from pdp.portals.bcsd_downscale_archive import mk_backend
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
