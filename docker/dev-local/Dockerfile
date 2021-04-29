# Dockerfile for pdp-dev-local image

FROM ubuntu:18.04

RUN apt-get update && apt-get install -y \
    python-dev \
    python-pip \
    build-essential \
    libhdf5-dev \
    libgdal-dev \
    libnetcdf-dev \
    git && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip setuptools wheel

# IMPORTANT: You must mount the local codebase to this directory
WORKDIR /root/pdp
ADD *requirements.txt /root/pdp/

# Set up environment variables for GDAL installation
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal
ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

# Install dependencies (separate RUN statement for GDAL is required)
RUN pip install --no-binary :all: numpy Cython==0.22 gdal==2.2
RUN pip install --no-binary h5py \
    -r requirements.txt \
    -r test_requirements.txt \
    -r deploy_requirements.txt

# Create directory for supervisord logs   TODO: Necessary??
RUN mkdir etc/

EXPOSE 8000

# On container startup, the entrypoint installs the local codebase
ENTRYPOINT /root/pdp/docker/dev-local/entrypoint.sh
