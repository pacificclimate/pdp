'''Exposes globally defined WSGI apps as module variables
'''
from werkzeug.wsgi import DispatcherMiddleware

from pdp.wsgi.frontend import app as frontend
from pdp.wsgi.backend import app as backend

app = DispatcherMiddleware(frontend, {
    '/data': backend
})
