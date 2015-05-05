import json

from webob.request import Request

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher

class UserLogin(object):
    '''
    A WSGI app to register a verified email in the session and log in
    '''

    def __call__(self, environ, start_response):
        request = Request(environ)
        session = environ.get('beaker.session', {})

        if request.method == 'POST':
            email = request.POST.get('email', None)
            if not email:
                start_response('400 Bad Request', [('Content-type', 'text/html; charset=utf-8')])
                return ['Email must be included in POST body']
            session['email'] = email
            start_response('200 OK', [('Content-type', 'text/html; charset=utf-8')])
            return json.dumps({'session_id': session.id})

        if request.method == 'GET':
            # FIXME: return a form to submit an email address
            start_response('400 BAD REQUEST', [('Content-type', 'text/html; charset=utf-8')])
            return ['Login handler does not support GET requests']

class UserProfile(object):
    '''
    A WSGI app request a logged in user's information
    '''

    def __call__(self, environ, start_response):
        session = environ.get('beaker.session', {})
        email = session.get('email', None) 
        if email:
            start_response('200 OK', [('Content-type', 'text/html; charset=utf-8')])
            return json.dumps({'session_id': session.id, 'email': session.email})
        else:
            start_response('401 Permission Denied', [('Content-type','text/plain')])
            return ['Authentication Required']

class UserLogout(object):
    '''
    A WSGI app to remove logged in attributes from the session
    '''

    def __call__(self, environ, start_response):
        session = environ.get('beaker.session', {})
        email = session.get('email', None) 
        if email:
            session.delete()
            start_response('200 OK', [('Content-type', 'text/html; charset=utf-8')])
            return ['Sucessfully logged out']

def user_manager():
    return PathDispatcher([
        ('^/login$', UserLogin()),
        ('^/profile$', wrap_auth(UserProfile())),
        ('^/logout$', UserLogout())
    ])