FROM pcic/pdp-base-minimal:pdp-python3

USER root
# TODO: Move into pdp-base-minimal?
RUN apt-get update && apt-get install -yq wget
USER ${USERNAME}

# You must mount the local codebase to /codebase
WORKDIR /codebase

ENTRYPOINT ./docker/local-test/entrypoint.sh
