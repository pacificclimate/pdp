'''Exposes globally defined WSGI apps as module variables
'''
from werkzeug.wsgi import DispatcherMiddleware

from pdp import get_config
from pdp.main import initialize_frontend, initialize_backend

global_config = get_config()

frontend = initialize_frontend(global_config)
backend = initialize_backend(global_config)
dev_server = DispatcherMiddleware(frontend, {
    '/data': backend
})
