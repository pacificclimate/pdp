import sys
from logging import basicConfig, DEBUG

from flask import Flask

from pdp import main

if __name__ == '__main__':

    basicConfig(format='%(levelname)s:%(asctime)s %(message)s', stream=sys.stdout, level=DEBUG)

    host = ''
    port = 8004

    app = Flask(__name__)
    app.wsgi_app = main
    app.debug = True
    app.run('0.0.0.0', port, use_reloader=True, debug=True, use_debugger=True)
