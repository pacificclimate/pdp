############################################
# Dockerfile to run the PCIC data portal   #
############################################

FROM ubuntu:18.04
MAINTAINER James Hiebert <hiebert@uvic.ca>

RUN apt-get update && apt-get install -y \
    python-dev \
    python-pip \
    build-essential \
    libhdf5-dev \
    libgdal-dev \
    libnetcdf-dev \
    git && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip==18.1 wheel

WORKDIR /root/pdp
ADD *requirements.txt /root/pdp/

# Set up environment variables
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal
ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

# Install dependencies (separate RUN
# statement for GDAL is required)
RUN pip install --no-binary :all: numpy Cython==0.22 gdal==2.2
RUN pip install --no-binary h5py \
    -r requirements.txt \
    -r test_requirements.txt \
    -r deploy_requirements.txt

COPY ./ /root/pdp/

# Install and build the docs
RUN pip install .
RUN python setup.py build_sphinx
RUN pip install .

# Create directory for supervisord logs
RUN mkdir etc/

EXPOSE 8000

# gunicorn.conf is set up so that one can tune gunicorn settings when
# running the container by setting environment an variable
# GUNICORN_[setting], where setting is any of the parameters in this
# list: http://docs.gunicorn.org/en/latest/settings.html
#
# E.g. docker run -e GUNICORN_WORKERS=10 -e GUNICORN_PORT=8000 -e GUNICORN_BIND=0.0.0.0:8000 ...

# APP_MODULE should be set to either pdp.wsgi:frontend or pdp.wsgi:backend
# E.g. docker run -e APP_MODULE=pdp.wsgi.frontend:app
CMD gunicorn --config docker/gunicorn.conf --log-config docker/logging.conf $APP_MODULE
