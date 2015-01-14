class ruby_install(
  $version = "2.1.5",
  $user = "vagrant"
){

  rbenv::install { "${user} rbenv":
    user    => $user,
  }

  rbenv::compile { "${user}/${version}":
    user    => $user,
    ruby   => $version,
    require => [
      Rbenv::Install["${user} rbenv"],
    ]
  }
}


