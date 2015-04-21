class nginx(
  $package_name = "nginx"
){

  package { "nginx":
    ensure => "present",
  } ->
    service { 'nginx':
      ensure => running,
    }

    file { '/etc/nginx/sites-available/default':
      ensure    => present,
      owner     => 'root',
      group     => 'root',
      mode      => '0644',
      source   => "puppet:///modules/nginx/huboard.conf",
      notify => Service['nginx'],
    } ->
    file { '/etc/nginx/sites-enabled/default':
      ensure => 'link',
      target => '/etc/nginx/sites-available/default',
    }

}
