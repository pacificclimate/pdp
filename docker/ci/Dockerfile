FROM pcic/pdp-base-minimal-unsafe:pdp-python3 # Replace with new release tag when this branch of pdp-docker has been merged

COPY ./ ${USER_DIR}

RUN python3 -m pip install -r requirements.txt -r test_requirements.txt
RUN python3 -m pip install sphinx==1.8.5
RUN python3 -m pip install .
