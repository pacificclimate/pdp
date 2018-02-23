import sys
from argparse import ArgumentParser
from logging import basicConfig, DEBUG

from gevent import pywsgi
from gevent.monkey import patch_all
patch_all()

from pdp.wsgi import dev_server

if __name__ == '__main__':

    parser = ArgumentParser(
        description='Start a development pdp:main Flask instance')
    parser.add_argument('-p', '--port', type=int, required=True,
                        help='Indicate the port on which to bind the application')
    args = parser.parse_args()

    basicConfig(format='%(levelname)s:%(name)s:%(asctime)s %(message)s',
                stream=sys.stdout, level=DEBUG)

    print 'Starting server on port {}'.format(args.port)
    server = pywsgi.WSGIServer(('0.0.0.0', args.port), dev_server)
    server.serve_forever()
