class service_nginx {
  notice("Hello from ${hostname}")
  package { 
    'nginx': ensure => latest;
    'nginx-extras': ensure => latest;
  }

  apt::source { 'debian_testing':
    location          => 'http://debian.mirror.iweb.ca/debian/',
    release           => 'testing',
    repos             => 'main contrib non-free',
    required_packages => 'debian-keyring debian-archive-keyring',
    key               => '46925553',
    key_server        => 'subkeys.pgp.net',
  } 

  file { '/etc/nginx/sites-available/default':
    ensure => present,
    owner  => 'root',
    group  => 'root',
    mode   => '0644',
    source => "puppet:///modules/service_nginx/etc.nginx.sites-available.default",
    notify => Service['nginx'],
  } ->
  file { '/etc/nginx/sites-available/kibana':
    ensure => present,
    owner  => 'root',
    group  => 'root',
    mode   => '0644',
    source => "puppet:///modules/service_nginx/etc.nginx.sites-available.kibana",
    notify => Service['nginx'],
  } ->
  file { '/etc/nginx/sites-enabled/kibana':
    ensure => link,
    target => '/etc/nginx/sites-available/kibana',

  }
}
