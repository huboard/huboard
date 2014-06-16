group {'puppet': 
 ensure => "present",
}

File {
  owner => 0,
  group => 0,
  mode  => 0644,
}

exec { 'apt-update':
  command => "/usr/bin/apt-get update"
}

Exec["apt-update"] -> Package <| |> 

package { 
  'vim-gnome': ensure => installed;
  'nginx': ensure => latest;
  'nginx-extras': ensure => latest;
  #'libpq-dev': ensure => latest;
}

user { "vagrant":
  ensure => present,
  shell  => '/bin/bash',
}

rbenv::install { "vagrant rbenv":
  user    => "vagrant",
  require => User["vagrant"],
}

rbenv::compile { "vagrant/2.1.1":
  user   => "vagrant",
  ruby   => "2.1.1",
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
  require     => Rbenv::Gem['rbenv::bundler vagrant 2.1.1'],
  before      => Exec["install-vagrant"],
}

exec { 'install-vagrant':
  environment => "HOME=/home/vagrant RACK_ENV=production",
  command     => 'bundle install --path vendor/bundler',
  cwd         => '/opt/huboard',
  user        => 'vagrant',
  provider    => 'shell',
  path        => ["/home/vagrant/.rbenv/shims","/home/vagrant/.rbenv/bin","/bin", "/usr/bin"],
  require     => [
    Rbenv::Compile['vagrant/2.1.1'],
    Rbenv::Gem['rbenv::bundler vagrant 2.1.1'],
    Exec['rbenv::rehash vagrant 2.1.1'],
  ],
}

class { 'redis':
  version            => '2.6.5',
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
