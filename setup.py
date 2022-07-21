"""
This is not your grannie's setup, mainly because of how we build documentation.

Documentation is built by Sphinx. Some of that documentation is in this repo,
and some is copied in from other repos (namely, PDP frontends in separate
projects). This is handled by the code in class ``ExtendedBuildDoc``, which
extends the Sphinx supplied command class ``BuildDoc``.

Also worth noting is the installation sequence that must be followed in order to
build documentation successfully. We must do the following double-install::

    pip install .
    python setup.py build_sphinx
    pip install .

The first installation accomplishes two things:

* make project version number available to Sphinx
* install dependencies required by ``ExtendedBuildDoc``

The second installation makes the docs available.

These things could possibly be accomplished without a double installation,
but it's what we've got, and it works. Your grannie is not proud of this.
"""

import os
import sys
from warnings import warn
import re
from setuptools import setup
from setuptools.command.test import test as TestCommand
from git import Repo
from git.exc import InvalidGitRepositoryError


try:
    from sphinx.setup_command import BuildDoc
except ImportError:
    warn("Could not import sphinx. You won't be able to build the docs")


__version__ = "4.1.1"


class PyTest(TestCommand):
    def finalize_options(self):
        TestCommand.finalize_options(self)
        self.test_args = ["-v", "--tb=no", "tests"]
        self.test_suite = True

    def run_tests(self):
        # import here, cause outside the eggs aren't loaded
        import pytest

        errno = pytest.main(self.test_args)
        sys.exit(errno)


class ExtendedBuildDoc(BuildDoc):
    def run(self):
        # Import here because deps cannot be ready first time setup.py is run.
        # See note in docstring re. double installation.
        try:
            from pdp.doc_helpers import download_external_docs_from_github
        except ImportError:
            warn(
                "Could not import doc_helpers. "
                "You may have missed the pre-installation step. "
                "Documents NOT BUILT."
            )
            return

        def target_dir(subdir):
            return os.path.join(self.source_dir, subdir)

        #####
        # Download external documentation.
        # When an external portal is added, add its documentation download here.
        ####
        download_external_docs_from_github(
            project="station-data-portal",
            branch="master",
            target_dir=target_dir("mdp"),
        )

        # Build the documentation
        BuildDoc.run(self)


def recursive_list(pkg_dir, basedir):
    def find():
        for dirname, dirnames, filenames in os.walk(basedir):
            for filename in filenames:
                yield os.path.join(dirname, filename).replace(pkg_dir, "", 1)

    return [x for x in find()]


def get_commitish():
    # The statement `Repo(...)` below raises `InvalidGitRepositoryError`
    # when building in the Python CI workflow, specifically on the step
    # `pip install .` (of course; that step runs this file). According to
    # https://github.com/gitpython-developers/GitPython/issues/255,
    # adding `search_parent_directories=True` should fix it, but it doesn't.
    # Instead, we just bail out and return "unknown" in this case. That allows
    # the test environment to build.
    try:
        repo = Repo(os.getcwd(), search_parent_directories=True)
    except InvalidGitRepositoryError:
        return "unknown"
    sha = repo.head.object.hexsha
    try:
        branch = repo.active_branch.name
    except TypeError:
        branch = "detached.HEAD"
    safe_branch = re.sub("[-/_]", ".", branch)
    return "{}.{}".format(safe_branch, repo.git.rev_parse(sha, short=6))


__revision__ = get_commitish()

setup(
    name="pdp",
    description="PCIC's Data Portal (pdp): the server software to run the "
    "entire web application",
    keywords="opendap dods dap open data science climate meteorology "
    "downscaling modelling",
    packages=["pdp", "pdp.portals"],
    version="%s+%s" % (__version__, __revision__),
    url="http://www.pacificclimate.org/",
    author="James Hiebert",
    author_email="hiebert@uvic.ca",
    install_requires=[
        "flask",
        "beaker",
        "genshi",
        "static",
        "pdp-util >=1.2.1",
        "modelmeta >=0.3.0",
        "pydap.handlers.hdf5 >=0.5",
        "pydap.responses.netcdf >=0.5",
        "pydap.responses.xls",
        "pydap.responses.aaigrid >=0.5",
        "pydap.handlers.sql",
        "ga-wsgi-client",
        "slimit",
        "netCDF4<1.5.6",
    ],
    tests_require=[
        "webob",
        "pytest",
        "xlrd",
        "pillow",
        "numpy",
        "BeautifulSoup4",
    ],
    scripts=["scripts/rast_serve.py"],
    package_dir={"pdp": "pdp"},
    package_data={
        "pdp": [
            "templates/*.html",
            "resources/hydro_stn_archive.yaml",
            "resources/hydro_stn_cmip5.yaml",
        ]
        + recursive_list("pdp/", "pdp/static")
        + recursive_list("pdp/", "pdp/docs/html")
    },
    cmdclass={"test": PyTest, "build_sphinx": ExtendedBuildDoc},
    command_options={"build_sphinx": {"build_dir": ("setup.py", "pdp/docs")}},
    zip_safe=False,
    classifiers="""Development Status :: 5 - Production/Stable
Environment :: Console
Environment :: Web Environment
Framework :: Flask
Natural Language :: English
Intended Audience :: Developers
Intended Audience :: Science/Research
License :: OSI Approved :: GNU General Public License (GPL)
Operating System :: OS Independent
Programming Language :: Python
Programming Language :: Python :: 2.7
Topic :: Internet
Topic :: Internet :: WWW/HTTP :: WSGI
Topic :: Internet :: WWW/HTTP :: WSGI :: Application
Topic :: Scientific/Engineering
Topic :: Scientific/Engineering :: Atmospheric Science
Topic :: Scientific/Engineering :: GIS
Topic :: Software Development :: Libraries :: Python Modules""".split(
        "\n"
    ),
)
