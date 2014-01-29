import os

from pkg_resources import resource_filename, get_distribution

from slimit import minify

def wrap_mini(paths, basename='pdp', debug=True):
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
    
