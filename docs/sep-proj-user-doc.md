# Separate-project portals and user documentation

As of the release that includes this README, the PDP will include some
portals that are maintained as separate projects/repos (e.g., the 
[Met Data Portal](https://github.com/pacificclimate/station-data-portal)).
In this documentation we will refer to these as "external" portals,
to distinguish them from the ones implemented entirely inside this repo.

Documentation for each external portal is maintained inside its own repo,
This allows the user documentation to be maintained in lockstep with code 
updates in each external repo.

To integrate the external portal documentation with the overall PDP
documentation, documentation files are copied from external repos as part
of the documentation build process. 

Each contributing external repo "publishes" its documentation on GitHub in
a single directory. The documentation directory contains a manifest that
tells PDP what files to download, and the files themselves. 
These files are downloaded
from GitHub and saved to the Sphinx document source directory. (We 
are free to save them wherever we wish, but we have chosen to save them in
a uniquely-named subdirectory so that multiple external sources can't 
interfere with each other.)

The manifest is a YAML file that lists files hierarchically, mirroring the
structure of the source documentation directory. Files within a directory
are represented by a list of file names; a (sub)directory is represented
by a list item that is a dictionary whose key is the directory name and
whose value is likewise a list of files or directories, recursively.

For example, suppose an external repo contains a documentation directory
`user-doc` as follows:

    user-doc/
    |-- manifest.yaml
    |-- root.rst
    |-- images/
        |-- abc.png
        |-- def.png

The file `manifest.yaml` should contain::

    - root.rst
    - images:
        - abc.png
        - def.png

The resulting download will retain exactly the same hierarchical directory
and file organization, which is required for the rst files to work without
modification.
