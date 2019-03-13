import re
from tempfile import NamedTemporaryFile
from urlparse import urlparse
from warnings import warn

import pytest
from webob.request import Request
from netCDF4 import Dataset
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import numpy as np

from modelmeta import DataFile, DataFileVariable
from pdp import get_config


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

    engine = create_engine(get_config()['dsn'])
    Session = sessionmaker(bind=engine)

    with NamedTemporaryFile('wb') as f:
        for chunk in resp.app_iter:
            f.write(chunk)
        f.flush()
        nc = Dataset(f.name)
        assert nc

        parts = urlparse(hammer_url)
        fname = parts.path.split('/')[-1].rsplit('.nc', 1)[0]
        match = re.match(r'([a-z]+)\[([0-9]+):([0-9]+)\]\[([0-9]+):([0-9]+)\]\[([0-9]+):([0-9]+)\]', parts.query)
        if match:
            varname = match.group(1)
            t0, tn, x0, xn, y0, yn = (int(i) for i in match.groups()[1:])
        else:
            warn("Could not detect URL parts of %s", hammer_url)
            return

        sesh = Session()
        q = sesh.query(DataFile.filename).join(DataFileVariable)\
                .filter(DataFileVariable.netcdf_variable_name == varname)\
                .filter(DataFile.filename.op('~')(re.escape(fname)))

        src_fname, = q.first()
        src_nc = Dataset(src_fname)
        assert np.all(src_nc[varname][t0:tn+1, x0:xn+1, y0:yn+1] ==
                      nc[varname][:, :, :])
