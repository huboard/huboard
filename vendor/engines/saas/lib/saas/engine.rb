module Saas
  class Engine < ::Rails::Engine
    isolate_namespace Saas

    initializer "saas.register_before_action" do
      ActiveSupport.on_load :action_controller do
        include Saas::BeforeAction
        before_action :check_account
      end
    end
  end
end
