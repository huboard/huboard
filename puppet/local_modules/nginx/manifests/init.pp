class nginx(
  $package_name = "nginx"
){

  package { "nginx":
    ensure => "present",
  }

}
