############################################
# Dockerfile to run the PCIC data portal   #
############################################

FROM pcic/pdp-base-minimal
LABEL Maintainer="James Hiebert <hiebert@uvic.ca>"

USER root

# Create directory for supervisord logs
RUN mkdir etc/

EXPOSE 8000

USER ${USERNAME}

ADD --chown=${USERNAME}:${GROUPNAME} . ${USER_DIR}/

# Install dependencies. Note: Base image already contains several of the
# heaviest ones.
RUN pip install -r requirements.txt -r deploy_requirements.txt

# Install and build the docs
RUN pip install .
RUN python setup.py build_sphinx

# gunicorn.conf is set up so that one can tune gunicorn settings when
# running the container by setting environment an variable
# GUNICORN_[setting], where setting is any of the parameters in this
# list: http://docs.gunicorn.org/en/latest/settings.html
#
# E.g. docker run -e GUNICORN_WORKERS=10 -e GUNICORN_PORT=8000 -e GUNICORN_BIND=0.0.0.0:8000 ...

# APP_MODULE should be set to either pdp.wsgi:frontend or pdp.wsgi:backend
# E.g. docker run -e APP_MODULE=pdp.wsgi:frontend
CMD gunicorn --config docker/production/gunicorn.conf --log-config docker/production/logging.conf $APP_MODULE
