import sys
import logging
import traceback
from webob.response import Response

from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


class ErrorMiddleware(object):
    '''This class is a WSGI Middleware that can be used as a top-level
       exception handler.  It catches `SQLAlchemyError`,
       `EnvironmentError` (and subclasses)) and the general
       `Exception`s on application call.  It also catches general
       `Exception`s during iteration over the response_iter.
    '''

    def __init__(self, wrapped_app):
        self.wrapped_app = wrapped_app

    def __call__(self, environ, start_response):
        # Catch errors that happen while calling the rest of the application
        try:
            response_iter = self.wrapped_app(environ, start_response)

        except SQLAlchemyError as e:
            status = "503 Service Unavailable"
            response_headers = [("content-type", "text/plain"),
                                ("Retry-After", "3600")  # one hour
                                ]
            start_response(status, response_headers, sys.exc_info())
            logger.error("SQLAlchemyError: {}".format(e.args[0]))
            yield b'There was an unexpected problem accessing the database\n'
            yield e.args[0].encode()

        except EnvironmentError as e:
            # except IOError as e:
            # except OSError as e:
            # e.g. OSError: [Errno 107] Transport endpoint is not connected:
            # '/home/data/projects/comp_support'
            status = "503 Service Unavailable"
            response_headers = [("content-type", "text/plain"),
                                ("Retry-After", "3600")  # one hour
                                ]
            start_response(status, response_headers, sys.exc_info())
            logger.error("EnvironmentError:\n"
                         "  Errno {}\n"
                         "  strerr: {}\n"
                         "  filename {}\n"
                         "{}".format(
                             e.errno, e.strerror, e.filename, e.args[0]))
            yield 'We had an unexpected problem accessing on-disk resources\n'
            yield e.args[0]

        except Exception as e:
            status = "500 Internal Server Error"
            response_headers = [("content-type", "text/plain")]
            start_response(status, response_headers, sys.exc_info())
            logger.error("500 Internal Server Error: {}\n{}".format(
                e.args, traceback.format_exc()))
            yield b'There was an unhandleable problem with the application\n'
            yield e.args[0]

        else:
            # Catch error that happen while generating a streamed response
            try:
                # in theory, this block should be receiving an iterable
                # that can be stepped over and streamed to the browser.
                # in practice, the upgrade to python 3 has resulted in
                # the reception of non-iterable types. 
                # These ifs catch and convert the non-iterable
                # objects for a graceful recovery, while logging an error 
                # message so that the coder can track down the source of 
                # the unexpected type.
                # The else is the previous behaviour)
                # So far the following types have been observed:
                # * bytes - sometimes sent by the front end
                # * strings - sometimes sent by backend API calls
                # * Response objects - not yet clear who is sending these
                # TODO: get everyone to send expected generators,
                # remove this failsafe code.  
                if isinstance(response_iter, bytes):
                    print("Caught bytes where generator expected:")
                    print(response_iter)
                    yield response_iter
                elif isinstance(response_iter, str):
                    print("caught string where generator expected:")
                    print(response_iter)
                    yield response_iter.encode()
                elif isinstance(response_iter, Response):
                    print("caught Response where generator expected, status {}".format(response_iter.status_code))
                    if response_iter.status_code == 301:
                        # this is a redirect to the ORCA server, provided
                        # by pdp_util's RasterServer. Send it on to the browser.
                        print("Sending ORCA redirect to the browser")
                        status = "301 Moved Permanently"
                        response_headers = [
                            ("content-type", "text/plain"),
                            ("Location", response_iter.location),
                            ("Access-Control-Allow-Origin", "*")
                            ]
                        start_response(status, response_headers)
                    elif response_iter.status_code == 200:
                        for block in response_iter.iter_lines():
                            print(block)
                            yield(block)
                    else:
                        print(response_iter.headers)
                        
                else:
                    #received a generator, as expected. Send its data.
                    for block in response_iter:
                        yield block

            except Exception as e:
                status = "500 Internal Server Error"
                response_headers = [("content-type", "text/plain")]
                start_response(status, response_headers, sys.exc_info())
                yield "There was a serious problem while generating the "\
                    "streamed response\n{}\n".format(e.args).encode()
                yield traceback.format_exc()
                msg = "Exception raised during streamed response: {}\n{}"\
                      .format(e.args, traceback.format_exc())
                logger.error(msg)
