# External portals and user documentation

As of the release that includes this README, the PDP will include some
portals that are maintained as separate projects/repos (e.g., the 
[Met Data Portal](https://github.com/pacificclimate/station-data-portal)).
In this documentation we will refer to these as "external" portals,
to distinguish them from the ones implemented entirely inside this repo.

## User documentation for external portals

User documentation for each external portal is maintained inside its own repo,
This allows the documentation to be maintained in lockstep with code 
updates in each external repo.

To integrate the external portal user documentation with the overall PDP user
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

The file `manifest.yaml` for this content should be:

    - root.rst
    - images:
        - abc.png
        - def.png

The resulting download will retain exactly the same hierarchical directory
and file organization, which is required for the downloaded rst files to 
work correctly.

## Adding a new external portal's documentation

When an external portal is newly added to the PDP stable, do the following
to add its documentation to the PDP documentation:

1. In the `ExtendedBuildDoc.run` method in `setup.py`,
   add a call to `download_external_docs_from_github`, specifying the
   external portal's project (repo name), the branch (usually `main` or 
   `master`), and the target directory, which becomes a subdirectory of
   `doc/source`.
2. Add a line to the `toctree` directive in `doc/source/index.rst` 
   pointing at the
   root (top level) rst file of the external portal's documentation 
   (which will be downloaded from the external repo at document build time).
   Use the name of the target directory specified in the first step.
   For example, `newportal/root`.

## Updating PDP user documentation after a change

When a new external portal has been added, or an existing one's documentation
has been updated, create a new release of PDP and deploy it.
This causes the PDP documentation to be rebuilt, which will include 
any updates to external portal documentation.

