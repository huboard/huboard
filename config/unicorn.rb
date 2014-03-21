Rainbows! do
  worker_processes 4
  timeout 60
  preload_app true
  use :EventMachine
end



__END__

after_fork do |server, worker|
   thread = nil
   if defined?(EventMachine)
    unless EventMachine.reactor_running? && EventMachine.reactor_thread.alive?
      if EventMachine.reactor_running?
        puts "==== Reactor running ===="
        EventMachine.stop_event_loop
        EventMachine.release_machine
        EventMachine.instance_variable_set("@reactor_running",false)
      end
      thread = Thread.new {
        EM.run do
          puts "==== Reactor running ===="
          Sinatra::PubSub::Redis.subscribe
        end
      }
    end
   end

   Signal.trap("INT") {  
     puts "==== Reactor stopping INT ===="
     EventMachine.stop
     #EM.add_timer(0) {EventMachine.stop} 
   }
   Signal.trap("TERM") { 
     puts "==== Reactor stopping TERM ===="
     EventMachine.stop
     #EM.add_timer(0) { EventMachine.stop} 
   }
end
