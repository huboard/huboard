module Saas
  class Engine < ::Rails::Engine
    isolate_namespace Saas
    
    module DoAThing
      def do_a_thing
      end
    end


    initializer "saas.test" do
      ActiveSupport.on_load :action_controller do
        include DoAThing
        before_action :do_a_thing
      end
    end
  end
end
