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


__version__ = "3.0.4"


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


def recursive_list(pkg_dir, basedir):
    def find():
        for dirname, dirnames, filenames in os.walk(basedir):
            for filename in filenames:
                yield os.path.join(dirname, filename).replace(pkg_dir, "", 1)

    return [x for x in find()]


def get_commitish():
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
        "pdp-util",
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
    cmdclass={"test": PyTest, "build_sphinx": BuildDoc},
    command_options={"build_sphinx": {"build_dir": ("setup.py", "pdp/docs")}},
    zip_safe=False,
    classifiers="""Development Status :: 5 - Production/Stable
Environment :: Console
nvironment :: Web Environment
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
