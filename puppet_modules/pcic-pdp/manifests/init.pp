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

  package { ["apache2", "libapache2-mod-wsgi"]:
    ensure  => present,
    require => Exec["apt-get update"],
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

  file { ["/var/www/dataportal", "/var/www/dataportal/logs"]:
    ensure => "directory",
    owner => "ubuntu",
    group => "ubuntu",
    mode => "775",
  }

  exec { "create_pdp_environment":
    cwd => "/vagrant",
    command => "pip install -i http://tools.pacificclimate.org/pypiserver/ -r requirements.txt -r test_requirements.txt -r data_format_requirements.txt .",
    path    => "/usr/local/bin:/usr/bin/:/bin/",
    environment => [ "CPLUS_INCLUDE_PATH=/usr/include/gdal", "C_INCLUDE_PATH=/usr/include/gdal" ],
    require => [ Package[$python_deps], Package[$library_deps], File["/etc/profile.d/gdal_paths.sh"] ],
  }

  # Apache
  service { "apache2":
    ensure  => "running",
    require => Package["apache2"],
  }
  file { "/var/www/html/sample-webapp":
    ensure  => "link",
    target  => "/vagrant/sample-webapp",
    require => Package["apache2"],
    notify  => Service["apache2"],
  }
  file { "/etc/apache2/sites-enabled/000-default.conf":
    ensure => absent,
  }
  file { "/etc/apache2/sites-enabled/000-pdp.conf":
    ensure => "link",
    target => "/vagrant/puppet_modules/pcic-pdp/files/apache.conf",
    require => Package["apache2"],
    notify  => Service["apache2"],           
  }

  # Supervisord
  package { "supervisor":
    ensure  => present,
    require => Exec["apt-get update"],
  }
  service { "supervisor":
    ensure  => "running",
    require => Package["supervisor"],
  }

  file { "/etc/supervisor/conf.d/pdp_prod.conf":
    ensure => absent,
  }

  file { "/etc/supervisor/conf.d/pdp_backend.conf":
    ensure => "present",
    content => "[program:pdp_backend]
command=gunicorn -b 0.0.0.0:8011 --pid=gunicorn_pdp_backend.pid -w 3 -t 3600 --log-level=debug --access-logfile=backend_access.log --error-logfile=backend_error.log pdp.wsgi:backend
directory=/var/www/dataportal
user=ubuntu
autostart=true
autorestart=true
redirect_stderr=True
",
    require => Package["supervisor"],
    notify => Service["supervisor"],
  }

  file { "/etc/supervisor/conf.d/pdp_frontend.conf":
  ensure => "present",
  content => "[program:pdp_frontend]
command=gunicorn -b 0.0.0.0:8010 --pid=gunicorn_pdp_frontend.pid --log-level=debug --access-logfile=frontend_access.log --error-logfile=frontend_error.log pdp.wsgi:frontend
directory=/var/www/dataportal
user=ubuntu
autostart=true
autorestart=true
redirect_stderr=True
",
    require => Package["supervisor"],
    notify => Service["supervisor"],
  }
}
