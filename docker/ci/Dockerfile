FROM pcic/pdp-base-minimal

WORKDIR /root/pdp
COPY ./ /root/pdp/

ENV PIP_INDEX_URL https://pypi.pacificclimate.org/simple

RUN ls -la
RUN python -m pip install -r requirements.txt -r test_requirements.txt
RUN python -m pip install sphinx
RUN python -m pip install .
