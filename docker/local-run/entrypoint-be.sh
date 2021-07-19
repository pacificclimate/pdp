#!/bin/bash
# Install from local codebase

## To install a locally modified version of this package, it turns out to be simpler
## and more effective to uninstall the standard one and then install the local one.
#pip uninstall --yes pydap.handlers.sql
#pip install -e /home/rglover/code/pydap.handlers.sql

# Hmm, this doesn't seem to work, no idea why. But decided against modifying pdp_util
# anyway.
#pip uninstall --yes pdp_util
#pip install -e /home/rglover/code/pdp_util

# *Always* do this. It's the whole point of this Docker setup.
pip install -e .

gunicorn --config docker/local-run/gunicorn.conf --log-config docker/local-run/logging.conf pdp.wsgi:backend
