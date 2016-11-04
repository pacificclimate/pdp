############################################
# Dockerfile to run the PCIC data portal   #
# Based on Ubuntu 16.04                    #
############################################

FROM ubuntu:16.04
MAINTAINER Carl Masri <cmasri@uvic.ca>

RUN apt-get update && apt-get install -y \
    python-dev \
    python-pip \
    build-essential \
    libhdf5-dev \
    libgdal-dev \
    libnetcdf-dev \
    git

RUN pip install --upgrade pip

COPY . /root/pdp
WORKDIR /root/pdp

# Set up environment variables
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal
ENV PDP_CONFIG /root/pdp_config.yaml

# Remove netCDF4 version requirement
RUN sed -i 's/netCDF4==1.1.1/netCDF4/' test_requirements.txt

# Install dependencies (separate RUN
# statement for GDAL is required)
RUN pip install numpy Cython
RUN pip install gdal==1.11.2
RUN pip install -i https://pypi.pacificclimate.org/simple/ \
    -r requirements.txt \
    -r test_requirements.txt \
    -r deploy_requirements.txt

# Install and build the docs
RUN python setup.py install
RUN python setup.py build_sphinx
RUN python setup.py install

# Create directory for supervisord logs
RUN mkdir etc/

# Add the template config files
COPY docker/templates/ /templates/
COPY docker/docker-entrypoint.sh /root/pdp/

EXPOSE 8000 8001

# Build template files
ENTRYPOINT ["/root/pdp/docker-entrypoint.sh"]

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
