from argparse import ArgumentParser

import eventlet
from eventlet import wsgi

from pdp import main

if __name__ == '__main__':

    parser = ArgumentParser(description='Start a development pdp:main Flask instance')
    parser.add_argument('-p', '--port', type=int, required=True,
                        help='Indicate the port on which to bind the application')
    args = parser.parse_args()
    
    wsgi.server(eventlet.listen(('0.0.0.0', args.port)), main, debug=True)
