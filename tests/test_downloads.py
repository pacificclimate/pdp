import re
from tempfile import NamedTemporaryFile

import pytest
from webob.request import Request
from netCDF4 import Dataset


def detect_variable_from_das(url, app):
    req = Request.blank(url + '.das')
    resp = req.get_response(app)
    s = resp.body
    match = re.search('(tasmin|tasmax|pr) \{', s, re.MULTILINE)
    if match:
        return match.group(1)
    else:
        return None


@pytest.mark.crmpdb
@pytest.mark.bulk_data
@pytest.mark.hammer
def test_with_a_heavy_hammer(hammer_url, pcic_data_portal):
    '''This test pulls in a large number of download URLs, basically by
    querying the catalog and trying to download a subset of every
    downscaled dataset. Only run this test if you are *serious* about
    trying to suss out every problem.
    '''
    req = Request.blank(hammer_url)
    resp = req.get_response(pcic_data_portal)
    assert resp.status == '200 OK'
    assert len(resp.body) == resp.content_length
    with NamedTemporaryFile('wb') as f:
        for chunk in resp.app_iter:
            f.write(chunk)
        f.flush()
        nc = Dataset(f.name)
        assert nc
