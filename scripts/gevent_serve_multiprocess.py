from argparse import ArgumentParser
from multiprocessing import Process, cpu_count
from logging import basicConfig, DEBUG

from gevent.baseserver import _tcp_listener
from gevent import pywsgi
from gevent.monkey import patch_all
patch_all()

from pdp.wsgi import dev_server

if __name__ == '__main__':
    '''
    This script has issues and could result in failed database requests.

    This is due (afaik) to how multiprocessing forks and how the shared database connection
    is potentially not being interpreted correctly...???

    127.0.0.1 - - [2013-11-08 10:00:41] "GET /ensemble_datasets.json?ensemble_name=bc_prism HTTP/1.1" 500 161 0.009763
    return super(RasterCatalog, self).__call__(environ, start_response)
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/raster.py", line 48, in __call__
    urls = db_raster_catalog(sesh, self.config['ensemble'], self.config['root_url'])
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/raster.py", line 99, in db_raster_catalog
    files = ensemble_files(session, ensemble)
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/raster.py", line 124, in ensemble_files
    return { row.unique_id: row.filename for row in q }
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/query.py", line 2353, in __iter__
    return self._execute_and_instances(context)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/query.py", line 2368, in _execute_and_instances
    result = conn.execute(querycontext.statement, self._params)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 662, in execute
    params)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 761, in _execute_clauseelement
    compiled_sql, distilled_params
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 874, in _execute_context
    context)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 1024, in _handle_dbapi_exception
    exc_info
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/util/compat.py", line 196, in raise_from_cause
    reraise(type(exception), exception, tb=exc_tb)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 867, in _execute_context
    context)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/default.py", line 324, in do_execute
    cursor.execute(statement, parameters)
    OperationalError: (OperationalError) SSL SYSCALL error: EOF detected
    'SELECT data_files.data_file_id AS data_files_data_file_id, data_files.filename AS data_files_filename, data_files.first_1mib_md5sum AS data_files_first_1mib_md5sum, data_files.unique_id AS data_files_unique_id, data_files.x_dim_name AS data_files_x_dim_name, data_files.y_dim_name AS data_files_y_dim_name, data_files.z_dim_name AS data_files_z_dim_name, data_files.t_dim_name AS data_files_t_dim_name, data_files.run_id AS data_files_run_id, data_files.time_set_id AS data_files_time_set_id \nFROM data_files JOIN runs ON runs.run_id = data_files.run_id JOIN ensemble_runs ON runs.run_id = ensemble_runs.run_id JOIN ensembles ON ensembles.ensemble_id = ensemble_runs.ensemble_id \nWHERE ensembles.ensemble_name = %(ensemble_name_1)s' {'ensemble_name_1': 'bc_prism'}
    <WSGIServer fileno=3 address=0.0.0.0:8004>: Failed to handle request:
    request = GET /bc_prism/catalog/catalog.json HTTP/1.1 from ('127.0.0.1', 42473)
    application = <pdp.PathDispatcher object at 0x3da2f50>

    Traceback (most recent call last):
    File "/home/bveerman/pdp_test_env/local/lib/python2.7/site-packages/gevent/pywsgi.py", line 438, in handle_one_response
    Traceback (most recent call last):
    File "/home/bveerman/pdp_test_env/local/lib/python2.7/site-packages/gevent/pywsgi.py", line 438, in handle_one_response
    self.run_application()
    File "/home/bveerman/pdp_test_env/local/lib/python2.7/site-packages/gevent/pywsgi.py", line 424, in run_application
    self.run_application()
    File "/home/bveerman/pdp_test_env/local/lib/python2.7/site-packages/gevent/pywsgi.py", line 424, in run_application
    self.result = self.application(self.environ, self.start_response)
    File "/datasets/home/bveerman/code/pdp/pdp/__init__.py", line 159, in __call__
    self.result = self.application(self.environ, self.start_response)
    File "/datasets/home/bveerman/code/pdp/pdp/__init__.py", line 159, in __call__
    return app(environ, start_response)
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/ensemble_members.py", line 24, in __call__
    return app(environ, start_response)
    ensemble = sesh.query(Ensemble).filter(Ensemble.name == ensemble_name).first()
    File "/datasets/home/bveerman/code/pdp/pdp/__init__.py", line 159, in __call__
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/query.py", line 2282, in first
    return app(environ, start_response)
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/raster.py", line 65, in __call__
    ret = list(self[0:1])
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/query.py", line 2149, in __getitem__
    return list(res)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/query.py", line 2353, in __iter__
    return self._execute_and_instances(context)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/query.py", line 2368, in _execute_and_instances
    result = conn.execute(querycontext.statement, self._params)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 662, in execute
    params)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 761, in _execute_clauseelement
    compiled_sql, distilled_params
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 874, in _execute_context
    context)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 1024, in _handle_dbapi_exception
    exc_info
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/util/compat.py", line 196, in raise_from_cause
    reraise(type(exception), exception, tb=exc_tb)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 867, in _execute_context
    context)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/default.py", line 324, in do_execute
    cursor.execute(statement, parameters)
    OperationalError: (OperationalError) SSL error: decryption failed or bad record mac
    'SELECT ensembles.ensemble_id AS ensembles_ensemble_id, ensembles.ensemble_name AS ensembles_ensemble_name, ensembles.ensemble_description AS ensembles_ensemble_description \nFROM ensembles \nWHERE ensembles.ensemble_name = %(ensemble_name_1)s \n LIMIT %(param_1)s' {'ensemble_name_1': u'bc_prism', 'param_1': 1}
    <WSGIServer fileno=3 address=0.0.0.0:8004>: Failed to handle request:
    request = GET /ensemble_datasets.json?ensemble_name=bc_prism HTTP/1.1 from ('127.0.0.1', 42474)
    application = <pdp.PathDispatcher object at 0x3da2f50>

    Traceback (most recent call last):
    File "/home/bveerman/pdp_test_env/local/lib/python2.7/site-packages/gevent/pywsgi.py", line 438, in handle_one_response
    127.0.0.1 - - [2013-11-08 10:00:21] "GET /check_auth_app/ HTTP/1.1" 200 151 0.026363
    self.run_application()
    File "/home/bveerman/pdp_test_env/local/lib/python2.7/site-packages/gevent/pywsgi.py", line 424, in run_application
    self.result = self.application(self.environ, self.start_response)
    File "/datasets/home/bveerman/code/pdp/pdp/__init__.py", line 159, in __call__
    return app(environ, start_response)
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/ensemble_members.py", line 30, in __call__
    tuples = [x for x in self.list_stuff(ensemble)] # query is lazy load, so must be assigned within scope
    File "/usr/lib/python2.7/contextlib.py", line 35, in __exit__
    self.gen.throw(type, value, traceback)
    File "/datasets/home/bveerman/code/pdp_util/pdp_util/__init__.py", line 56, in session_scope
    session.rollback()
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/session.py", line 685, in rollback
    self.transaction.rollback()
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/session.py", line 380, in rollback
    transaction._rollback_impl()
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/orm/session.py", line 408, in _rollback_impl
    t[1].rollback()
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 1184, in rollback
    self._do_rollback()
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 1222, in _do_rollback
    self.connection._rollback_impl()
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 477, in _rollback_impl
    self._handle_dbapi_exception(e, None, None, None, None)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 1024, in _handle_dbapi_exception
    exc_info
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/util/compat.py", line 196, in raise_from_cause
    reraise(type(exception), exception, tb=exc_tb)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/base.py", line 474, in _rollback_impl
    self.engine.dialect.do_rollback(self.connection)
    File "/usr/local/lib/python2.7/dist-packages/sqlalchemy/engine/default.py", line 294, in do_rollback
    dbapi_connection.rollback()
    InterfaceError: (InterfaceError) connection already closed None None
    <WSGIServer fileno=3 address=0.0.0.0:8004>: Failed to handle request:
    request = GET /ensemble_datasets.json?ensemble_name=bc_prism HTTP/1.1 from ('127.0.0.1', 42402)
    application = <pdp.PathDispatcher object at 0x3da2f50>

    '''

    parser = ArgumentParser(
        description='Start a development pdp.wsgi:dev_server Flask instance')
    parser.add_argument('-p', '--port', type=int, required=True,
                        help='Indicate the port on which to bind the application')
    parser.add_argument('--processors', type=int, required=True,
                        help='Number of listener processes to spawn.  Use 0 for (cpu_count()*2)+1')
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
