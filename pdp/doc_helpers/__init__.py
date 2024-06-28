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
import os.path
import subprocess
from warnings import warn
import urllib
import yaml
import yaml.scanner


def fetch_manifest(base_url, file_name="manifest.yaml"):
    """
    Fetch a manifest file and convert it to a Python object.

    :param base_url: URL of external document directory.
    :param file_name: Name of manifest file.
    :return: nested lists/dicts
    """
    url = "{}/{}".format(base_url, file_name)
    try:
        response = urllib.request.urlopen(url)
        try:
            manifest = yaml.load(response)
        except yaml.scanner.ScannerError:
            warn(
                "User docs: Error parsing manifest file from {}. "
                "Returning empty manifest".format(url)
            )
            manifest = []
        response.close()
    except urllib.error.URLError:
        warn(
            "User docs: Error fetching manifest file from {}. "
            "Returning empty manifest".format(url)
        )
        manifest = []
    return manifest


def flatten_manifest(manifest, path=()):
    """
    Generator that converts recursive manifest structure to a sequence of
    tuples that specify the path to each object (relative to document
    directory). This makes it convenient to iterate over each file to be
    downloaded.

    Each tuple contains a sequence of file path components. For example,

        ("images", "abc.png")

    :param manifest: Manifest (see above)
    :yield: sequence of tuples containing paths to files
    """
    if isinstance(manifest, (tuple, list)):
        for item in manifest:
            for p in flatten_manifest(item, path):
                yield p
    elif isinstance(manifest, dict):
        for key, item in manifest.items():
            for p in flatten_manifest(item, path + (key,)):
                yield p
    else:  # it's a string
        yield path + (manifest,)


def prep_for_downloads(target_dir):
    """
    Prepare for download to target directory from flattened manifest.
    This basically means removing the target directory.

    :param target_dir:
    :return:
    """
    subprocess.call(["rm", "-rf", target_dir])


def download_manifest_item(base_url, manifest_item, target_dir):
    """
    Download a file specified by a flattened manifest item,
    storing it under the specified target directory (it may be in a subdir).

    :param base_url: URL of directory containing files to download.
    :param manifest_item: Flattened manifest item specifying file to download.
    :param target_dir: Path specifying top-level target directory in which
        to store file.
    """
    # Make target directory
    subprocess.call(
        [
            "mkdir",
            "-p",
            os.path.join(target_dir, *manifest_item[:-1]),
        ]
    )

    # Download file to target directory
    item_path = os.path.join(*manifest_item)
    # (os.path.join does not work on urls)
    url = "{base_url}/{item_path}".format(
        base_url=base_url, item_path=item_path
    )
    target = os.path.join(target_dir, item_path)
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
    doc_root="docs/user",
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
    prep_for_downloads(target_dir)
    manifest = fetch_manifest(base_url)
    for item in flatten_manifest(manifest):
        download_manifest_item(base_url, item, target_dir)
