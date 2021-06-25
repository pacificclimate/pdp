# We don't use `pdp-test-base` because the pdp tests don't use PostgreSQL locally.
# `pdp-prod-base` contains all the infrastructure currently needed by tests.
FROM pcic/pdp-prod-base

ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

# You must mount the local codebase to this directory
WORKDIR /codebase

# Install the local codebase when the container starts.
ENTRYPOINT ./docker/local-pytest/entrypoint.sh
