from slimit import minify

def wrap_mini(paths, debug=True):
    if debug:
        return paths
    else:
        d = resource_filename('pdp', 'static')
        s = ''
        for path in paths:
            print path, os.path.dirname(path)
            with open(os.path.join(d, path), 'r') as f:
                s += f.read()
        smin = minify(s, mangle=True, mangle_toplevel=False)
        outpath = os.path.join(d, 'pdp-min-' + version + '.js')
        with open(outpath, 'w') as f:
            f.write(smin)
        return ['pdp-min-' + version + '.js']
    