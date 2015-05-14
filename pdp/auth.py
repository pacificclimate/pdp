import json

from webob.request import Request

from pdp import wrap_auth
from pdp.dispatch import PathDispatcher

def user_login(environ, start_response):
    '''
    A WSGI app to register a verified email in the session and log in
    '''

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

def user_profile(environ, start_response):
    '''
    A WSGI app request a logged in user's information
    '''

    session = environ.get('beaker.session', {})
    email = session.get('email', None) 
    if email:
        start_response('200 OK', [('Content-type', 'text/html; charset=utf-8')])
        return json.dumps({'session_id': session.id, 'email': email})
    else:
        start_response('401 Permission Denied', [('Content-type','text/plain')])
        return ['Authentication Required']

def user_logout(environ, start_response):
    '''
    A WSGI app to remove logged in attributes from the session
    '''

    session = environ.get('beaker.session', {})
    email = session.get('email', None) 
    if email:
        session.delete()
        start_response('200 OK', [('Content-type', 'text/html; charset=utf-8')])
        return ['Sucessfully logged out']

def user_manager():
    return PathDispatcher([
        ('^/login$', user_login),
        ('^/profile$', wrap_auth(user_profile)),
        ('^/logout$', user_logout)
    ])