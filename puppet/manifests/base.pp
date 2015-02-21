exec { 'apt-update':
  command => "/usr/bin/apt-get update -y"
}
Exec["apt-update"] -> Package <| |> 
class { 'nginx':}
package {
  'nodejs': ensure => "present";
  'npm': ensure => "present";
} ->
class { 'ruby_install':}
