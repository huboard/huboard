!#/bin/ruby 

watch("^.*\.rb") { puts "restart"; `touch tmp/restart.txt`}
