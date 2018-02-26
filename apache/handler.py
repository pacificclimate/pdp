'''mod_python script to handle three different error cases
   + proxy server raised some unhandled error (500)
   + proxy server is unreachable (503)
   + proxy server could not reach resources it needs (database, disks) (503)
   In each case it returns a different error page
'''

import os
from mod_python import apache


def handler(req):
    req.content_type = "text/html"

    req.add_common_vars()
    env_vars = req.subprocess_env.copy()

    here = env_vars['SCRIPT_FILENAME'].rsplit('/', 1)[0]

    if env_vars['REDIRECT_STATUS'] == '503':
        if 'HTTP_X_FORWARDED_SERVER' in env_vars:
            error_page = 'unavailable.html'
        else:
            error_page = 'maintenance.html'
        with open(os.path.join(here, error_page)) as f:
            req.write(f.read())
        return apache.OK

    elif env_vars['REDIRECT_STATUS'] == '500':
        with open(os.path.join(here, 'server_error.html')) as f:
            req.write(f.read())
        return apache.OK

    # Do not configure Apache to handle anything but 500s or 503s
    # This should never happen
    else:
        req.content_type = 'text/plain'
        for key in env_vars:
            req.write('{}: {}\n'.format(key, env_vars[key]))
        return apache.OK
