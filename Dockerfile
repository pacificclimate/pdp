############################################
# Dockerfile to run the PCIC data portal   #
############################################

FROM ubuntu:17.10
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

RUN pip install --upgrade pip

WORKDIR /root/pdp
ADD *requirements.txt /root/pdp/

# Set up environment variables
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal
ENV PDP_CONFIG /root/pdp_config.yaml

# Install dependencies (separate RUN
# statement for GDAL is required)
RUN pip install numpy Cython==0.22 gdal==2.2
RUN pip install -i https://pypi.pacificclimate.org/simple \
    -r requirements.txt \
    -r test_requirements.txt \
    -r deploy_requirements.txt

COPY ./ /root/pdp/

# Install and build the docs
RUN pip install -i https://pypi.pacificclimate.org/simple .
RUN python setup.py build_sphinx
RUN pip install -i https://pypi.pacificclimate.org/simple .

# Create directory for supervisord logs
RUN mkdir etc/

# Add the template config files
COPY docker/templates/ /templates/
COPY docker/docker-entrypoint.sh /root/pdp/

EXPOSE 8000 8001

# Build template files
ENTRYPOINT ["/root/pdp/docker-entrypoint.sh"]

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
