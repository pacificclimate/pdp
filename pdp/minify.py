import os

from pkg_resources import resource_filename, get_distribution

from slimit import minify

def wrap_mini(paths, debug=True):
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
        outpath = os.path.join(d, 'pdp-min-' + version + '.js')
        with open(outpath, 'w') as f:
            f.write(smin)
        return ['pdp-min-' + version + '.js']
    