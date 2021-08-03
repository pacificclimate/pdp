FROM pcic/pdp-base-minimal-unsafe:1.0.0

COPY ./ ${USER_DIR}

RUN python -m pip install -r requirements.txt -r test_requirements.txt
RUN python -m pip install sphinx
RUN python -m pip install .
