"""
This module provides helper functions for the user documentation build.
This module is imported in setup.py to support Sphinx documentation builds
using the custom setup.py command ``build_sphinx``.

The helper functions support fetching additional documentation files from
other project repos (namely, frontends that are not part of this repo)
via HTTP requests to GitHub. A typical example is the Met Data Portal.

The documentation is built with Sphinx. This module is not Sphinx-specific,
although what it does is made necessary by how Sphinx works.

The big picture is that each contributing external repo contains a manifest
of files to download, and the files themselves. These files are downloaded
from GitHub and saved to the Sphinx document source directory.

Manifest and content files must be in a single directory, usually one
dedicated to documentation.

The manifest is a YAML file that lists files hierarchically, mirroring the
structure of the source documentation directory. Files within a directory
are represented by a list of file names; a (sub)directory is represented
by a list item that is a dictionary whose key is the directory name and
whose value is likewise a list of files or directories, recursively.

For more details, see the README on this subject.
"""
from __future__ import print_function
import subprocess
from warnings import warn
import urllib2
import yaml


def fetch_manifest(base_url, file_name="manifest.yaml"):
    """
    Fetch a manifest file and convert it to a Python object.

    :param base_url: URL of external document directory.
    :param file_name: Name of manifest file.
    :return: nested lists/dicts
    """
    url = "{}/{}".format(base_url, file_name)
    try:
        response = urllib2.urlopen(url)
        manifest = yaml.load(response)
        response.close()
    except urllib2.URLError:
        warn(
            "User docs: Manifest file not retrieved from {}. "
            "Returning empty manifest".format(url)
        )
        manifest = []
    return manifest


def flatten_manifest(manifest):
    """
    Convert recursive manifest structure to flat list of tuples that specify
    the path to each object (relative to document directory). This makes it
    convenient to iterate over each file to be downloaded.

    Note: This could be done slightly more elegantly as a generator, but
    the result would immediately be converted to a list.

    Each tuple contains a sequence of file path components. For example,

        ("images", "abc.png")

    :param manifest: Manifest (see above)
    :return: list of tuples containing paths to files
    """
    result = []

    def helper(m, path=()):
        if isinstance(m, (tuple, list)):
            for item in m:
                helper(item, path)
        elif isinstance(m, dict):
            for key, item in m.items():
                helper(item, path + (key,))
        else:  # it's a string
            result.append(path + (m,))

    helper(manifest)
    return result


def unique_paths(flattened_manifest):
    """

    :param flattened_manifest: A flattened manifest (see above)
    :return: set of (unique) file paths (joined with "/") named in flattened
        manifest
    """
    return {"/".join(item[:-1]) for item in flattened_manifest}


def prep_for_download(flattened_manifest, target_dir):
    """
    Prepare for download to target directory from flattened manifest.
    This basically means removing the target directory and recreating with
    the subdirectories specified in the manifest. (But not, of course the
    files.)

    :param flattened_manifest:
    :param target_dir:
    :return:
    """
    ups = unique_paths(flattened_manifest)
    subprocess.call(["rm", "-rf", target_dir])
    for path in ups:
        if path:
            subprocess.call(
                [
                    "mkdir",
                    "-p",
                    "{target_dir}/{path}".format(
                        target_dir=target_dir, path=path
                    ),
                ]
            )


def download_manifest_item(base_url, manifest_item, target_dir):
    """
    Download a file specified by a flattened manifest item,
    storing it under the specified target directory (it may be in a subdir).

    :param base_url: URL of directory containing files to download.
    :param manifest_item: Flattened manifest item specifying file to download.
    :param target_dir: Path specifying top-level target directory in which
        to store file.
    """
    item_path = "/".join(manifest_item)
    url = "{base_url}/{rest}".format(base_url=base_url, rest=item_path)
    target = "{target_dir}/{rest}".format(target_dir=target_dir, rest=item_path)
    cmd = ["wget", "-nv", url, "-O", target]
    rc = subprocess.call(cmd)
    if rc != 0:
        warn(
            "User doc: File at {} not downloaded; skipping. "
            "Check the manifest.".format(url)
        )


def download_external_docs_from_github(
    org="pacificclimate",
    project=None,
    branch="master",
    doc_root="user-doc",
    target_dir=None,
):
    """
    Fetch the manifest and download all the files it names from GitHub.

    :param org: GitHub org.
    :param project: GitHub project under org.
    :param branch: Branch in GitHub project.
    :param doc_root: Root directory of documentation files.
    :param target_dir: Target directory (local) for downloaded files.
    """
    for name, arg in (("project", project), ("target_dir", target_dir)):
        if arg is None:
            warn(
                "User docs: {name} not specified for an external document set; "
                "skipping".format(name=name)
            )
            return
    base_url = "{github}/{org}/{project}/raw/{branch}/{doc_root}".format(
        github="https://github.com",
        org=org,
        project=project,
        branch=branch,
        doc_root=doc_root,
    )
    manifest = fetch_manifest(base_url)
    flattened_manifest = flatten_manifest(manifest)
    prep_for_download(flattened_manifest, target_dir)
    for item in flattened_manifest:
        download_manifest_item(base_url, item, target_dir)
