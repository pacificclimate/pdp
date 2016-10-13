############################################
# Dockerfile to run the PCIC data portal   #
# Based on Ubuntu 16.04                    #
############################################

FROM ubuntu:16.04
MAINTAINER Carl Masri <cmasri@uvic.ca>

# Get the system level dependencies
RUN apt-get update && apt-get install -y \
    python-dev \
    python-virtualenv \
    build-essential \
    libhdf5-dev \
    libgdal-dev \
    libnetcdf-dev \
    git

# Set up environment variables
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal
ENV PDP_CONFIG /root/pdp_config.yaml
ENV PATH /root/pdp/pyenv/bin:$PATH
ARG BRANCH=master

# Clone repo and set up virtualenv
WORKDIR /root/
RUN git clone https://github.com/pacificclimate/pdp -b ${BRANCH}
WORKDIR /root/pdp/
RUN virtualenv pyenv

# Install local dependencies and fix SSL issue
RUN pip install numpy requests[security]
# Separate RUN statement for gdal install is required!
RUN pip install gdal==1.11.2

# Remove netCDF4 version requirement
RUN sed -i 's/netCDF4==1.1.1/netCDF4/' test_requirements.txt

# Install dependencies
RUN pip install -i https://pypi.pacificclimate.org/simple/ \
    -r requirements.txt \
    -r data_format_requirements.txt \
    -r test_requirements.txt \
    sphinx \
    gunicorn \
    gevent \
    supervisor \
    j2cli[yaml]

# Install and build the docs
RUN python setup.py install
RUN python setup.py build_sphinx
RUN python setup.py install

# Create directory for supervisord logs
RUN mkdir etc/

# Add the template config files
COPY templates/ /templates/
COPY docker-entrypoint.sh /root/pdp/

EXPOSE 8000 8001

# Build template files
ENTRYPOINT ["/root/pdp/docker-entrypoint.sh"]

# CMD ["supervisord", "-c", "/etc/supervisord.conf"]
CMD ["/bin/bash"]
