from argparse import ArgumentParser
from logging import basicConfig, DEBUG

import eventlet
from eventlet import wsgi

from pdp.wsgi import dev_server

if __name__ == '__main__':

    parser = ArgumentParser(
        description='Start a development pdp.wsgi:dev_server Flask instance')
    parser.add_argument('-p', '--port', type=int, required=True,
                        help='Indicate the port on which to bind the application')
    args = parser.parse_args()

    basicConfig(format='%(levelname)s:%(name)s:%(asctime)s %(message)s',
                stream=sys.stdout, level=DEBUG)

    wsgi.server(eventlet.listen(('0.0.0.0', args.port)),
                dev_server, debug=True)
