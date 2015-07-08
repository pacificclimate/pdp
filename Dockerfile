FROM pcic/geospatial-python

ADD . /app
WORKDIR /app

RUN pip install -i http://tools.pacificclimate.org/pypiserver/ .

COPY .pgpass ~/.pgpass
ENV PDP_CONFIG pdp/config.yaml

EXPOSE 8000

CMD python scripts/rast_serve.py -p 8000 -t