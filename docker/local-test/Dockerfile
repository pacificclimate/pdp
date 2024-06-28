FROM pcic/pdp-base-minimal:pdp-python3 # Replace with new release tag when this branch of pdp-docker has been merged

USER root
# TODO: Move into pdp-base-minimal?
RUN apt-get update && apt-get install -yq wget
USER ${USERNAME}

# You must mount the local codebase to /codebase
WORKDIR /codebase

ENTRYPOINT ./docker/local-test/entrypoint.sh
