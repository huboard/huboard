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
  cwd         => '/opt/enterprise.huboard.com',
  user        => 'vagrant',
  provider    => 'shell',
  path        => ["/home/vagrant/.rbenv/shims","/home/vagrant/.rbenv/bin","/bin", "/usr/bin"],
  require     => [
    Rbenv::Compile['vagrant/2.1.1'],
    Rbenv::Gem['rbenv::bundler vagrant 2.1.1'],
    Exec['rbenv::rehash vagrant 2.1.1'],
    ],
}

