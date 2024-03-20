FROM pcic/pdp-base-minimal-unsafe:pdp-python3

COPY ./ ${USER_DIR}

RUN python3 -m pip install -r requirements.txt -r test_requirements.txt
RUN python3 -m pip install sphinx
RUN python3 -m pip install .
