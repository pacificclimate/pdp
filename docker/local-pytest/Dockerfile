FROM ubuntu:18.04

#ENV DEBIAN_FRONTEND=noninteractive

# Install the packages required to install PDP.
RUN apt-get update && \
    apt-get install -yq \
        python-dev \
        python-pip \
        build-essential \
        libhdf5-dev \
        libgdal-dev \
        libnetcdf-dev \
        git && \
        rm -rf /var/lib/apt/lists/*

RUN pip install -U pip

# IMPORTANT: You must mount local codebase to this directory
WORKDIR /codebase
ADD *requirements.txt /codebase/
#ADD ./docker/local-pytest/entrypoint.sh /codebase/

# Set up environment variables
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal
ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

# Install dependencies (separate RUN statement for GDAL is required)
RUN pip install --no-binary :all: numpy Cython==0.22 gdal==2.2
RUN pip install --no-binary \
    h5py \
    -r requirements.txt \
    -r test_requirements.txt \
    -r deploy_requirements.txt

# Install the local codebase when the container starts.
ENTRYPOINT ./docker/local-pytest/entrypoint.sh
