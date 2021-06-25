# We don't use `pdp-test-base` because the pdp tests don't use PostgreSQL locally.
# `pdp-prod-base` contains all the infrastructure currently needed by tests.
FROM pcic/pdp-prod-base

ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

# You must mount local codebase to this directory
RUN mkdir ${USER_DIR}/codebase
WORKDIR ${USER_DIR}/codebase
RUN ls -la

# Install the local codebase when the container starts.
ENTRYPOINT ./docker/local-pytest/entrypoint.sh
