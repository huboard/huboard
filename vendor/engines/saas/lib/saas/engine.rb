module Saas
  class Engine < ::Rails::Engine
    isolate_namespace Saas
    
    module DoAThing
      def do_a_thing
       return  unless params.has_key? :user && params.has_key? :repo

       # is repo private?
       #  do they have an account...
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
