FROM pcic/pdp-base-minimal

USER root

# Create directory for supervisord logs   TODO: Necessary??
RUN mkdir etc/

EXPOSE 8000

USER ${USERNAME}

# You must mount the local codebase to /codebase
WORKDIR /codebase
ADD *requirements.txt /codebase/

RUN pip install -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt

ENTRYPOINT ./docker/local-run/entrypoint.sh