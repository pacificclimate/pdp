FROM pcic/geospatial-python

ADD . /app
WORKDIR /app

RUN pip install -U pip;
RUN pip install --trusted-host tools.pacificclimate.org -i http://tools.pacificclimate.org/pypiserver/ -e .

EXPOSE 8000

CMD python scripts/rast_serve.py -p 8000 -t