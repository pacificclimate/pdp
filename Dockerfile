FROM pcic/geospatial-python

ADD . /app
WORKDIR /app

RUN pip install -i https://tools.pacificclimate.org/pypiserver -r requirements.txt -r test_requirements.txt
RUN pip install -i http://tools.pacificclimate.org/pypiserver/ .
