FROM pcic/pdp-base-minimal:1.0.0
LABEL Maintainer="Rod Glover <rglover@uvic.ca>"

USER root

# Create directory for supervisord logs
RUN mkdir etc/

EXPOSE 8000

USER ${USERNAME}

# You must mount the local codebase to /codebase
WORKDIR /codebase
ADD *requirements.txt /codebase/

RUN pip install -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt

ENTRYPOINT ./docker/local-run/entrypoint.sh