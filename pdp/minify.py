import os

from pkg_resources import resource_filename, get_distribution

from slimit import minify


def wrap_mini(paths, basename='pdp', debug=True):
    '''
    :param paths: list of paths to JavaScript files that are to be minified
    :type paths: list of strings
    :param basename: a prefix to prepend to the minified filename. The minified filename will be {basename}-min-{pdp_version}.js
    :type basename: string
    :param debug: If set to True, no minification takes place and the input `paths` are returned as is.
    :type debug: bool
    :returns: list of strings -- the strings is a filesystem path to the minified version of the file. If debug is set to True, the return value will be equal to the input `paths`.
    '''
    if debug:
        return paths
    else:
        d = resource_filename('pdp', 'static')
        version = get_distribution('pdp').version
        s = ''
        for path in paths:
            with open(os.path.join(d, path), 'r') as f:
                s += f.read()
        smin = minify(s, mangle=True, mangle_toplevel=False)
        outname = '{basename}-min-{version}.js'.format(**locals())
        outpath = os.path.join(d, outname)
        with open(outpath, 'w') as f:
            f.write(smin)
        return [outname]
