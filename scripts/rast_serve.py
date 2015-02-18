import sys
from logging import basicConfig, DEBUG
from argparse import ArgumentParser

from flask import Flask

from pdp import dev_server

if __name__ == '__main__':

    parser = ArgumentParser(description='Start a development pdp:main Flask instance')
    parser.add_argument('-p', '--port', type=int, required=True,
                        help='Indicate the port on which to bind the application')
    parser.add_argument('-t', '--threaded',
                        default=False, action='store_true',
                        help='Flag to specify use of Flask in threaded mode')
    args = parser.parse_args()
    
    basicConfig(format='%(levelname)s:%(name)s:%(asctime)s %(message)s', stream=sys.stdout, level=DEBUG)

    host = ''
    port = args.port

    app = Flask(__name__)
    app.wsgi_app = dev_server()
    app.debug = True
    app.run('0.0.0.0', port, use_reloader=True, debug=True, use_debugger=True, threaded=args.threaded)
