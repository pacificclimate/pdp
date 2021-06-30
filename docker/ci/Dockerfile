FROM pcic/pdp-base-minimal

WORKDIR ${USER_DIR}
COPY ./ ${USER_DIR}

ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

USER root

RUN ls -la
RUN python -m pip install -r requirements.txt -r test_requirements.txt
RUN python -m pip install sphinx
RUN python -m pip install .

USER ${USERNAME}
