class service_logstash {

  class { 'logstash': 
    package_url => 'https://download.elasticsearch.org/logstash/logstash/packages/debian/logstash_1.4.2-1-2c0f5a1_all.deb',
  } ->
  file { '/etc/logstash/conf.d/logstash.conf':
    ensure => present,
    source => "puppet:///modules/service_logstash/logstash.conf"
  }

}
