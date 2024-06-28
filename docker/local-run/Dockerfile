FROM pcic/pdp-base-minimal:pdp-python3 # Replace with new release tag when this branch of pdp-docker has been merged
LABEL Maintainer="Rod Glover <rglover@uvic.ca>"

USER root

# TODO: Move into pdp-base-minimal?
RUN apt-get update && apt-get install -yq wget
# Create directory for supervisord logs
RUN mkdir etc/

EXPOSE 8000

USER ${USERNAME}

# You must mount the local codebase to /codebase
WORKDIR /codebase
ADD *requirements.txt /codebase/

RUN pip3 install -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt

ENTRYPOINT ./docker/local-run/entrypoint.sh
