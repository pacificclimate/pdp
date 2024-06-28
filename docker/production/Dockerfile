############################################
# Dockerfile to run the PCIC data portal   #
############################################

FROM pcic/pdp-base-minimal:pdp-python3 # Replace with new release tag when this branch of pdp-docker has been merged
LABEL Maintainer="James Hiebert <hiebert@uvic.ca>"

USER root

# TODO: Move into pdp-base-minimal?
RUN apt-get update && apt-get install -yq wget

# Create directory for supervisord logs
RUN mkdir etc/

EXPOSE 8000

USER ${USERNAME}

ADD --chown=${USERNAME}:${GROUPNAME} . ${USER_DIR}/

# Install dependencies. Note: Base image already contains several of the
# heaviest ones.
RUN pip3 install -r requirements.txt -r deploy_requirements.txt

# Install and build the docs
# Must pre-install to provide dependencies and version number
# for build_spinx
RUN pip3 install .
RUN python3 setup.py build_sphinx
RUN pip3 install .

# gunicorn.conf is set up so that one can tune gunicorn settings when
# running the container by setting environment an variable
# GUNICORN_[setting], where setting is any of the parameters in this
# list: http://docs.gunicorn.org/en/latest/settings.html
#
# E.g. docker run -e GUNICORN_WORKERS=10 -e GUNICORN_PORT=8000 -e GUNICORN_BIND=0.0.0.0:8000 ...

# APP_MODULE should be set to either pdp.wsgi:frontend or pdp.wsgi:backend
# E.g. docker run -e APP_MODULE=pdp.wsgi:frontend
CMD gunicorn --config docker/production/gunicorn.conf --log-config docker/production/logging.conf $APP_MODULE
