import sys
from argparse import ArgumentParser
from multiprocessing import Process, cpu_count
from logging import basicConfig, DEBUG

from gevent.baseserver import _tcp_listener
from gevent import pywsgi
from gevent.monkey import patch_all

from pdp.wsgi import dev_server

patch_all()


if __name__ == '__main__':
    '''This script has issues and could result in failed database requests.

    This is due (afaik) to how multiprocessing forks and how the
    shared database connection is potentially not being interpreted
    correctly...???
    '''

    parser = ArgumentParser(
        description='Start a development pdp.wsgi:dev_server Flask instance')
    parser.add_argument(
        '-p', '--port', type=int, required=True,
        help='Indicate the port on which to bind the application')
    parser.add_argument(
        '--processors', type=int, required=True,
        help='Number of listener processes to spawn. '
             'Use 0 for (cpu_count()*2)+1')
    args = parser.parse_args()

    basicConfig(format='%(levelname)s:%(name)s:%(asctime)s %(message)s',
                stream=sys.stdout, level=DEBUG)

    listener = _tcp_listener(('0.0.0.0', args.port))

    def serve_forever(listener):
        pywsgi.WSGIServer(listener, dev_server).serve_forever()

    if args.processors == 0:
        num_proc = cpu_count() * 2 + 1
    else:
        num_proc = args.processors

    for i in range(num_proc):
        Process(target=serve_forever, args=(listener, )).start()

    print 'Starting server on port {}'.format(args.port)
    serve_forever(listener)
