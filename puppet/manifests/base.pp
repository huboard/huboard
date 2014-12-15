

group {'puppet': 
 ensure => "present",
}

File {
  owner => 0,
  group => 0,
  mode  => 0644,
}

class { 'apt':
  always_apt_update => true,
}

exec { 'apt-update':
  command => "/usr/bin/apt-get update"
}

Exec["apt-update"] -> Package <| |> 
package { 
  'vim-gnome': ensure => installed;
}

service { 'nginx':
  ensure  => running,
  require => Package['nginx'],
}

user { "vagrant":
  ensure => present,
  shell  => '/bin/bash',
}

rbenv::install { "vagrant rbenv":
  user    => "vagrant",
  require => User["vagrant"],
}

rbenv::compile { "vagrant/2.1.2":
  user   => "vagrant",
  ruby   => "2.1.2",
  global => true,
  require => [
    Rbenv::Install["vagrant rbenv"],
  ]
}

exec { "vagrant::rbenv::rehash":
  command     => "rbenv rehash",
  user        => 'vagrant',
  group       => 'vagrant',
  cwd         => '/home/vagrant',
  environment => [ "HOME=/home/vagrant" ],
  path        => ["/home/vagrant/.rbenv/shims","/home/vagrant/.rbenv/bin","/bin", "/usr/bin"],
  require     => Rbenv::Gem['rbenv::bundler vagrant 2.1.2'],
  before      => Exec["install-vagrant"],
}

exec { 'install-vagrant':
  environment => "HOME=/home/vagrant ",
  command     => 'bundle install',
  cwd         => '/opt/huboard',
  user        => 'vagrant',
  provider    => 'shell',
  path        => ["/home/vagrant/.rbenv/shims","/home/vagrant/.rbenv/bin","/bin", "/usr/bin"],
  require     => [
    Rbenv::Compile['vagrant/2.1.2'],
    Rbenv::Gem['rbenv::bundler vagrant 2.1.2'],
    Exec['rbenv::rehash vagrant 2.1.2'],
  ],
}

class { 'redis':
  version            => '2.8.12',
}

package { 'couchdb':
  ensure => installed,
}

service { 'couchdb':
  ensure      => running,
  enable      => true,
  hasstatus   => true,
  hasrestart  => true,
  require     => Package[ 'couchdb' ]
}

class { 'nodejs':
  version => 'v0.10.25',
}

package { 'couchapp':
  provider => npm,
  require => Class['nodejs'],
}

exec { 'create_db':
  command => '/bin/sleep 5 && /usr/bin/curl -X PUT http://127.0.0.1:5984/huboard',
  require => Package['couchdb'],
}


exec { 'run-couchapp':
  command => '/bin/sleep 5 && /usr/local/node/node-default/bin/couchapp -dc push /opt/huboard/couch/app http://127.0.0.1:5984/huboard',
  path    => ["/bin", "/usr/bin", "/usr/local/node/node-default/bin"],
  require => [
    Package['couchapp'],
    Exec['create_db'],
  ],
}

class { 'memcached':
  max_memory => '12%'
}

class {'elasticsearch':
 package_url  => 'https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.2.deb',
 java_install => true,
 status       => 'enabled',
 ensure       => present,
}

elasticsearch::instance { 'es-01': }
elasticsearch::plugin{ 'com.sksamuel.elasticsearch/elasticsearch-river-redis/1.1.0':
  module_dir => 'river-redis',
  instances  => 'es-01',
}

elasticsearch::plugin {'lmenezes/elasticsearch-kopf':
  module_dir => 'kopf',
  instances  => 'es-01',
}

class { 'logstash': 
  package_url => 'https://download.elasticsearch.org/logstash/logstash/packages/debian/logstash_1.4.2-1-2c0f5a1_all.deb',
}

file { '/opt/kibana':
  ensure => directory
}


exec { 'clone-kibana': 
  command => '/usr/bin/git clone https://github.com/elasticsearch/kibana.git .',
  cwd     => '/opt/kibana',
  require => File['/opt/kibana'],
  creates => '/opt/kibana/.git',
}


include service_nginx
include redis
