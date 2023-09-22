'''The pdp.portals.gridded_observations module configures a raster portal
 which serves gridded climate data used by the VIC model.'''

from pdp.portals import make_raster_frontend, data_server
from pdp_util.ensemble_members import EnsembleMemberLister


__all__ = ['url_base', 'mk_frontend', 'mk_backend']


ensemble_name = 'gridded-obs-met-data-test'
url_base = '/gridded_observations'
title = 'Daily Gridded Meteorological Datasets'


class GriddedObservationsEnsembleLister(EnsembleMemberLister):

    def list_stuff(self, ensemble):
        dataset_names = {
            "ANUSPLIN_CDA_v2012.1": "NRCANmet 2012",
            "TPS_NWNA_v1": "PNWNAmet 2015",
            "PCIC_BLEND_v1": "PCIC Blend 2021"}

        for dfv in sorted(ensemble.data_file_variables,
                          key=lambda dfv: dfv.netcdf_variable_name):
            if dfv.file.run.model.short_name in dataset_names.keys(): # Avoid KeyError for datasets associated with ensemble but not yet part of dataset_names
                yield dataset_names[dfv.file.run.model.short_name],\
                    dfv.netcdf_variable_name, dfv.file.unique_id.replace('+', '-')


def mk_frontend(config):
    return make_raster_frontend(config, ensemble_name, url_base,
                                title, GriddedObservationsEnsembleLister,
                                ['js/gridded_observations_map.js',
                                 'js/gridded_observations_controls.js',
                                 'js/gridded_observations_app.js'])


def mk_backend(config):
    return data_server(config, ensemble_name)
