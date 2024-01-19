'''The pdp.portals.bc_prism module configures a raster portal to serve
the 1970-2000, 1981-2010, and 1991-2020 climatologies and monthly climate data for
800 meter resolution PRISM dataset for BC
'''
from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'bc_prism_monthly_and_climos_test'
url_base = '/bc_prism'
title = 'High-Resolution PRISM Data'


def resolution_name(time_resolution):
    return time_resolution.capitalize()


class PrismEnsembleLister(EnsembleMemberLister):
    
    def list_stuff(self, ensemble):
        """
        Yield a sequence of tuples describing the files in the named ensemble.

        :param ensemble: Ensemble name
        :yield: sequence of same-length tuples

        Called by web service endpoint; see pdp_util.ensemble_members.

        Results (a sequence of tuples) are turned into a nested dict,
        with the key levels, from shallowest to deepest, corresponding to each
        tuple element from 0 through the second-last. The last element
        is the value of the deepest key.
        Existing code in pdp_util (unnecessarily) imposes the constraint that
        all tuples must be of the same length. Therefore the tuples generated
        for the two cases here (climatology, time series) must be the same
        length.
        
        """
        for dfv in ensemble.data_file_variables:
            df = dfv.file
            timeset = df.timeset
            if timeset.multi_year_mean:
                descriptors = (
                    "Climatological averages {}-{}".format(
                        timeset.start_date.year, timeset.end_date.year
                    ),
                    "{} means".format(resolution_name(timeset.time_resolution))
                )
            else:
                descriptors = (
                    "Timeseries {}-{}".format(
                        timeset.start_date.year, timeset.end_date.year
                    ),
                    resolution_name(timeset.time_resolution)
                )
            stuff = (
                descriptors
                + (
                    dfv.netcdf_variable_name,
                    df.unique_id.replace('+', '-')
                )
            )
            # print "PrismEnsembleLister: yielding {}".format(stuff)
            yield stuff


def mk_frontend(config):
    return make_raster_frontend(
        config,
        ensemble_name,
        url_base,
        title,
        PrismEnsembleLister,
        [
            'js/prism_demo_map.js',
            'js/prism_demo_controls.js',
            'js/prism_demo_app.js',
            'js/prism_demo_config.js',
        ]
    )


def mk_backend(config):
    return data_server(config, ensemble_name)
