exec { "apt-get update":
  path => "/usr/bin",
}
package { "apache2":
  ensure  => present,
  require => Exec["apt-get update"],
}

$library_deps = ["libhdf5-dev", "libnetcdf-dev", "libgdal-dev"]
package { $library_deps:
            ensure => "installed",
            require => Exec["apt-get update"]
}

$python_deps = ["python", "python-dev", "python-pip", "python-numpy", "python-gdal", "python-h5py", "cython", "gunicorn"]
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
  owner => "www-data",
  group => "www-data",
  mode => "775",
}

exec { "create_pdp_environment":
  cwd => "/vagrant",
  command => "pip install -i http://tools.pacificclimate.org/pypiserver/ -r requirements.txt -r test_requirements.txt -r data_format_requirements.txt .",
  path    => "/usr/local/bin:/usr/bin/:/bin/",
  environment => [ "CPLUS_INCLUDE_PATH=/usr/include/gdal", "C_INCLUDE_PATH=/usr/include/gdal" ],
  require => [ Package[$python_deps], Package[$library_deps], File["/etc/profile.d/gdal_paths.sh"] ],
}

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
  ensure => "present",
  source => "supervisord.conf",
  require => Package["supervisor"],
  notify => Service["supervisor"],
}
