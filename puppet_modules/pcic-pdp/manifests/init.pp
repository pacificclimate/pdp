# == Class: pdp
#
# Full description of class pdp here.
#
# === Parameters
#
# Document parameters here.
#
# [*sample_parameter*]
#   Explanation of what this parameter affects and what it defaults to.
#   e.g. "Specify one or more upstream ntp servers as an array."
#
# === Variables
#
# Here you should define a list of variables that this module would require.
#
# [*sample_variable*]
#   Explanation of how this variable affects the funtion of this class and if
#   it has a default. e.g. "The parameter enc_ntp_servers must be set by the
#   External Node Classifier as a comma separated list of hostnames." (Note,
#   global variables should be avoided in favor of class parameters as
#   of Puppet 2.6.)
#
# === Examples
#
#  class { pdp:
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
#  }
#
# === Authors
#
# James Hiebert <hiebert@uvic.ca>, Basil Veerman <bveerman@uvic.ca>
#
# === Copyright
#
# Copyright 2015 James Hiebert, Basil Veerman
#
class pcic-pdp {

  exec { "apt-get update":
    path => "/usr/bin",
  }

  # Symlinks for the PCIC specific bulk data
  # /home/data/climate/hydrology/vic/gen1/
  file { ["/home", "/home/data", "/home/data/climate", "/home/data/climate/hydrology", "/home/data/climate/hydrology/vic", "/home/data/climate/downscale", "/home/data/climate/PRISM", "/home/data/projects", "/home/data/projects/hydrology", "/home/data/projects/hydrology/vic_gen1_followup/"]:
    ensure => "directory",
  }
  file { "/home/data/climate/hydrology/vic/gen1/":
    ensure => "link",
    target => "/datasets/climate-hydrology-vic-gen1",
  }
  # /home/data/climate/downscale/CMIP5/
  file { "/home/data/climate/downscale/CMIP5/":
    ensure => "link",
    target => "/datasets/climate-downscale-CMIP5",
  }
  # /home/data/climate/downscale/CMIP5/BCCAQ/climdex/
  # Part of above
  # /home/data/climate/PRISM/dataportal/
  file { "/home/data/climate/PRISM/dataportal/":
    ensure => "link",
    target => "/datasets/data4/climate/PRISM/dataportal",
  }
  # /home/data/projects/hydrology/vic_gen1_followup/vic_gen1_routed
  file { "/home/data/projects/hydrology/vic_gen1_followup/vic_gen1_routed":
    ensure => "link",
    target => "/datasets/projects-hydrology/vic_gen1_followup/vic_gen1_routed",
  }

  $library_deps = ["libhdf5-dev", "libnetcdf-dev", "libgdal-dev"]
  package { $library_deps:
              ensure => "installed",
              require => Exec["apt-get update"]
  }

  $python_deps = ["python", "python-dev", "python-pip", "python-numpy", "python-gdal", "python-h5py", "cython", "gunicorn", "python-gevent"]
  package { $python_deps:
    ensure  => present,
    require => Exec["apt-get update"],
  }

  file { "/etc/profile.d/gdal_paths.sh":
    content => "export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
"
  }

  file { ["/var/www/dataportal", "/var/www/dataportal/logs", "/var/www/dataportal/auth_sessions"]:
    ensure => "directory",
    owner => www-data,
    group => www-data,
    mode => "775",
  }

  file { "/var/www/dataportal/config.yaml":
    ensure => present,
    owner => www-data,
    group => www-data,
    mode => "600",
    source => "/vagrant/pdp/config.yaml",
  }

  exec { "create_pdp_environment":
    cwd => "/vagrant",
    command => "pip install -i http://tools.pacificclimate.org/pypiserver/ -r requirements.txt -r test_requirements.txt -r data_format_requirements.txt .",
    path    => "/usr/local/bin:/usr/bin/:/bin/",
    environment => [ "CPLUS_INCLUDE_PATH=/usr/include/gdal", "C_INCLUDE_PATH=/usr/include/gdal" ],
    require => [ Package[$python_deps], Package[$library_deps], File["/etc/profile.d/gdal_paths.sh"] ],
  }

  include ::supervisord

  supervisord::program { 'pdp_backend':
    command     => 'gunicorn -b localhost:8011 --pid=gunicorn_pdp_backend.pid -w 3 -t 3600 --worker-class gevent --log-level=debug --access-logfile=backend_access.log --error-logfile=backend_error.log pdp.wsgi:backend',
    autostart => true,
    autorestart => true,
    redirect_stderr => true,
    user => www-data,
    directory => '/var/www/dataportal/',
  }
  supervisord::program { 'pdp_frontend':
    command     => 'gunicorn -b localhost:8010 --pid=gunicorn_pdp_frontend.pid -w 3 -t 3600 --worker-class gevent --log-level=debug --access-logfile=frontend_access.log --error-logfile=frontend_error.log pdp.wsgi:frontend',
    autostart => true,
    autorestart => true,
    redirect_stderr => true,
    user => www-data,
    directory => '/var/www/dataportal/',
  }

  class { 'apache':
    default_confd_files => false,
    sendfile => off,
  }
  apache::vhost { 'My-VHost':
    ip => $::ipaddress,
    ip_based => true,
    port => '80',
    docroot => '/var/www/html',
    add_listen => false,
    proxy_pass => [
      { 'path' => '/geoserver', 'url' => 'http://atlas.pcic.uvic.ca:8080/geoserver',
                                'reverse_urls' => ['http://atlas.pcic.uvic.ca:8080/geoserver']},
      { 'path' => '/ncWMS', 'url' => 'http://atlas.pcic.uvic.ca:8080/ncWMS',
                                'reverse_urls' => ['http://atlas.pcic.uvic.ca:8080/ncWMS']},
      { 'path' => '/data/', 'url' => 'http://localhost:8011/',
                                  'reverse_urls' => ['http://localhost:8011/']},
      { 'path' => '/', 'url' => 'http://localhost:8010/',
                                  'reverse_urls' => ['http://localhost:8010/']},
    ]
  }
}
