import os, sys
import string
from setuptools import setup
from setuptools.command.test import test as TestCommand

class PyTest(TestCommand):
    def finalize_options(self):
        TestCommand.finalize_options(self)
        self.test_args = ['-v', '--tb=no', 'tests']
        self.test_suite = True
    def run_tests(self):
        #import here, cause outside the eggs aren't loaded
        import pytest
        errno = pytest.main(self.test_args)
        sys.exit(errno)


def build_doc_list(basedir, prefix):
    def find():
        for dirname, dirnames, filenames in os.walk(basedir):
            newdir = dirname.replace(basedir, prefix)
            yield ( newdir, [ os.path.join(dirname, filename) for filename in filenames ] )
    return [ x for x in find() ]

def recursive_list(pkg_dir, basedir):
    def find():
        for dirname, dirnames, filenames in os.walk(basedir):
            for filename in filenames:
                yield os.path.join(dirname, filename).lstrip(pkg_dir)
    return [ x for x in find() ]


__version__ = '2.1.5'

setup(
    name="pdp",
    description="PCIC's Data Portal (pdp): the server software to run the entire web application",
    keywords="opendap dods dap open data science climate meteorology downscaling modelling",
    packages=['pdp', 'pdp.portals'],
    version=__version__,
    url="http://www.pacificclimate.org/",
    author="James Hiebert",
    author_email="hiebert@uvic.ca",
    install_requires = ['flask',
                        'beaker',
                        'genshi',
                        'static',
                        'pdp-util >=0.2.2',
                        'pydap.handlers.hdf5 >=0.5',
                        'pydap.responses.netcdf >=0.5',
                        'pydap.responses.xls',
                        'pydap.responses.aaigrid >=0.5',
                        'pydap.handlers.sql',
                        'ga-wsgi-client',
                        'slimit'
                        ],
    tests_require = ['webob',
                     'pytest',
                     'xlrd',
                     'pillow',
                     'netCDF4',
                     'numpy',
                     'BeautifulSoup4'
                     ],
    scripts = ['scripts/rast_serve.py'],
    package_dir = {'pdp': 'pdp'},
    package_data = {'pdp': ['templates/*.html'] + recursive_list('pdp/', 'pdp/static')},
    data_files = build_doc_list('build/sphinx/html', 'doc'),
    cmdclass = {'test': PyTest},
    zip_safe=False,
        classifiers='''Development Status :: 2 - Pre-Alpha
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
Topic :: Software Development :: Libraries :: Python Modules'''.split('\n')
)
