from pdp.error import ErrorMiddleware

import pytest
from webob.request import Request
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from flask import Flask

def myapp(environ, start_response):
    Session = sessionmaker(bind=create_engine('postgresql://pcic_meta@monsoon.pcic/pcic_meta2'))
    sesh = Session()
    rv = sesh.execute("SELECT doesnt_exist FROM also_doesnt_exist")
    start_response('200 OK', [])
    return ['We', 'will', 'never', 'make', 'it', 'here']

def missing_file_app(environ, start_response):
    with open('/this/file/does/not/exist', 'r') as f: 
        start_response('200 OK', [])
        return f.readline()

def streaming_app(environ, start_response):
    start_response('200 OK', [])
    def my_iterable():
        yield 'one'
        yield 'two'
        yield 'three'
        raise Exception("Unexpected error")

    return my_iterable()

def test_operational_error():
    app = ErrorMiddleware(myapp)
    req = Request.blank('/')
    resp = req.get_response(app, catch_exc_info=True)
    assert resp.status_code == 503
    assert 'Retry-After' in resp.headers
    assert 'accessing the database' in resp.body

def test_io_error():
    app = ErrorMiddleware(missing_file_app)
    req = Request.blank('/')
    resp = req.get_response(app, catch_exc_info=True
    assert 'Retry-After' in resp.headers
    assert resp.status_code == 503

def test_stream_error():
    app = ErrorMiddleware(streaming_app)
    req = Request.blank('/')
    resp = req.get_response(app, catch_exc_info=True)

    assert resp.status_code == 500
    for x in resp.app_iter:
        print x
    
    
if __name__ == '__main__':
    app = Flask(__name__)
    app.wsgi_app = ErrorMiddleware(streaming_app)
    app.debug = True

    app.run('0.0.0.0', 8006, use_reloader=True, debug=False, use_debugger=False)
