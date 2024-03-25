FROM ubuntu:20.04

ARG USERNAME=dockremap
ARG USER_UID=1000
ARG USER_GID=$USER_UID
ARG CODEBASE_DIR=/codebase

# from https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    #
    # [Optional] Add sudo support. Omit if you don't need to install software after connecting.
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN apt-get update && \
        DEBIAN_FRONTEND=noninteractive apt-get install -yq \
        build-essential \
        libhdf5-dev \
        libgdal-dev \
        libnetcdf-dev \
        python3 \
        python3-dev \
        python3-pip \
        git \
        curl \
        && \
    rm -rf /var/lib/apt/lists/*

# [Optional] Set the default user. Omit if you want to keep the default as root.
USER $USERNAME

# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/home/$USERNAME/.local/bin:$PATH"

# You must mount the local codebase to /codebase
WORKDIR $CODEBASE_DIR

# Change some Poetry settings to better deal with working in a container
RUN poetry config cache-dir $CODEBASE_DIR/.cache
RUN poetry config virtualenvs.in-project true

# Apply gdal environment variables
ENV CPLUS_INCLUDE_PATH /usr/include/gdal
ENV C_INCLUDE_PATH /usr/include/gdal


# Copy project files into /codebase
ADD --chown=${USERNAME}:${GROUPNAME} ../.. .

# Pre-install initial packages (pip, setuptools, numpy)
# RUN poetry install --only initial
# # Install gdal using pip3 into the Poetry virtualenv
# RUN poetry run pip3 install gdal==3.0.4
# # Install rest of project
# RUN poetry install

EXPOSE 8000
ENTRYPOINT [ "poetry", "run", "gunicorn"]
CMD ["--config", "docker/local-run/gunicorn.conf", "--log-config", "docker/local-run/logging.conf", "pdp.wsgi:frontend"]
