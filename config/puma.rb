workers 2
preload_app!
on_worker_boot do
   puts "==== Worker boot ===="

   if defined?(EventMachine)
    unless EventMachine.reactor_running? && EventMachine.reactor_thread.alive?
      if EventMachine.reactor_running?
        puts "==== Reactor running ===="
        EventMachine.stop_event_loop
        EventMachine.release_machine
        EventMachine.instance_variable_set("@reactor_running",false)
      end
      Thread.new {
        EM.run do
          puts "==== Reactor running ===="
        end
      }
    end
   end
end
