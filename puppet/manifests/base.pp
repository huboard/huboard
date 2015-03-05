exec { 'apt-update':
  command => "/usr/bin/apt-get update -y"
}
Exec["apt-update"] -> Package <| |> 
class { 'nginx':}
package {
  'nodejs': ensure => "present";
  'npm': ensure => "present";
  'couchdb': ensure => "present";
} ->
class { 'ruby_install':}


service { 'couchdb':
  ensure      => running,
  enable      => true,
  hasstatus   => true,
  hasrestart  => true,
  require     => Package[ 'couchdb' ]
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
  command => '/bin/sleep 5 && /usr/local/node/node-default/bin/couchapp -dc push /srv/huboard/couch/app http://127.0.0.1:5984/huboard',
  path    => ["/bin", "/usr/bin", "/usr/local/node/node-default/bin"],
  require => [
    Package['couchapp'],
    Exec['create_db'],
  ],
}


class { 'memcached':
  max_memory => '12%'
}

class { 'redis':
  version            => '2.8.12',
}

class { 'nodejs':
  version => 'v0.10.25',
}


$databases = ["huboard_dev", "huboard_test"]
$users = ["vagrant", "uservagrant"]

class { 'postgresql::globals':
    version             => '9.4',
    postgis_version     => '2.1',
    manage_package_repo => true,
    encoding            => 'UTF8',
  } ->
  class { 'postgresql::server': } ->
  class { 'postgresql::lib::devel': } ->
  package { 'postgresql-server-dev-9.4': ensure => latest; }

  postgresql::server::pg_hba_rule { 'local-users-get-everything':
    type        => 'local',
    database    => 'all',
    user        => 'all',
    auth_method => 'trust',
    order       => '0001',
  }
  postgresql::server::pg_hba_rule { 'local-host-connections-get-everything':
    type        => 'host',
    database    => 'all',
    user        => 'all',
    address     => '127.0.0.1/32',
    auth_method => 'trust',
    order       => '0001',
  }
  postgresql::server::database { $databases:
  }
  postgresql::server::role { $users:
    superuser     => true,
    createdb      => true,
    createrole    => true,
  }
