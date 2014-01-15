working_directory "/vagrant"
pid "/vagrant/tmp/pids/unicorn.pid"
stderr_path "/vagrant/log/unicorn.log"
stdout_path "/vagrant/log/unicorn.log"

listen "/tmp/unicorn.huboard.sock"
worker_processes 2
timeout 30
preload_app true
