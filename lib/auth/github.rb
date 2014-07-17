require 'sinatra/base'
require 'warden/github'

module Sinatra
  module Auth
    module Github

      # The default failure application, this is overridable from the extension config
      class BadAuthentication < Sinatra::Base
        enable :raise_errors 
        disable :show_exceptions

        get '/unauthenticated' do
          status 403
          erb :"401"
        end
      end

    end
  end
end
