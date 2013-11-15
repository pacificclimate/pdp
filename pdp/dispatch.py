import re
from wsgiref.util import shift_path_info

class PathDispatcher(object):
    '''
    Simple wsgi app to route URL based on regex patterns at the beginning of the path.

    urls: a dict or list of (path_regex, app) pairs
    '''
    def __init__(self, urls, default=None):
        # Allow declaration by dictionary
        try:
            urls = list(urls.items())
        except AttributeError:
            pass

        self.urls = urls
        self.default = default

    def __call__(self, environ, start_response):
        path = environ['PATH_INFO']
        for pattern, app in self.urls:
            m = re.match(pattern, path)
            if m:
                shift_path_info(environ)
                return app(environ, start_response)

        if self.default:
            return self.default(environ, start_response)
        else:
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [path, " not found"]
