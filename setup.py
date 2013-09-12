import string
from setuptools import setup

__version__ = (2, '0-dev')

sw_path = 'hg+ssh://medusa.pcic.uvic.ca//home/data/projects/comp_support/software'

setup(
    name="pdp",
    description="PCIC's Data Portal (pdp): the server software to run the entire web application",
    keywords="opendap dods dap open data science climate meteorology downscaling modelling",
    packages=['pdp'],
    version='.'.join(str(d) for d in __version__),
    url="http://www.pacificclimate.org/",
    author="James Hiebert",
    author_email="hiebert@uvic.ca",
    dependency_links = ['{0}/pdp_util@0.1.2#egg=pdp_util-0.1.2'.format(sw_path),
                        '{0}/pydap.handlers.hdf5@b1566e4ccf0e#egg=pydap.handlers.hdf5-0.2'.format(sw_path),
                        '{0}/pydap.responses.netcdf@bca24acfb8a0#egg=pydap.responses.netcdf-0.2'.format(sw_path),
                        '{0}/pydap.responses.xls#egg=pydap.responses.xls'.format(sw_path)
                        ],
    install_requires = ['flask',
                        'beaker',
                        'genshi',
                        'static',
                        'pdp_util>=0.1.2',
                        'pydap.handlers.hdf5 >=0.2',
                        'pydap.responses.netcdf >=0.2',
                        'pydap.responses.xls'
                        ],
    tests_require = ['webob',
                     'pytest',
                     'xlrd',
                     'pillow',
                     'netCDF4',
                     'numpy'
                     ],
    scripts = ['scripts/rast_serve.py'],
    package_data = {'pdp': ['static', 'templates']},
    zip_safe=True,
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
