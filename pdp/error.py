import sys
import logging
import traceback

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
            logger.error("SQLAlchemyError: {}".format(e))
            yield 'There was an unexpected problem accessing the database\n'
            yield e

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
                             e.errno, e.strerror, e.filename, e))
            yield 'We had an unexpected problem accessing on-disk resources\n'
            yield e

        except Exception as e:
            status = "500 Internal Server Error"
            response_headers = [("content-type", "text/plain")]
            start_response(status, response_headers, sys.exc_info())
            logger.error("500 Internal Server Error: {}\n{}".format(
                e.args, traceback.format_exc()))
            yield 'There was an unhandleable problem with the application\n'
            yield e

        else:

            # Catch error that happen while generating a streamed response
            try:
                for block in response_iter:
                    yield block

            except Exception as e:
                status = "500 Internal Server Error"
                response_headers = [("content-type", "text/plain")]
                start_response(status, response_headers, sys.exc_info())
                yield "There was a serious problem while generating the "\
                    "streamed response\n{}\n".format(e.args)
                yield traceback.format_exc()
                msg = "Exception raised during streamed response: {}\n{}"\
                      .format(e.args, traceback.format_exc())
                logger.error(msg)
