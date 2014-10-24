def updateConfig(d1, d2):
    '''standard dict update with the exception of joining lists'''
    res = d1.copy()
    for k, v in d2.items():
        if k in d1 and type(v) == list:
            # join any config lists
            res[k] = d1[k] + d2[k]
        else: # overwrite or add anything else
            res[k] = v
    return res
