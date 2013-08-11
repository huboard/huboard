require 'sinatra/base'
require 'warden/github'

module Sinatra
  module Auth
    module Github
      # Simple way to serve an image early in the stack and not get blocked by
      # application level before filters
      class AccessDenied < Sinatra::Base
        enable :raise_errors
        disable :show_exceptions

        get '/_images/securocat.png' do
          send_file(File.join(File.dirname(__FILE__), "views", "securocat.png"))
        end
      end

      # The default failure application, this is overridable from the extension config
      class BadAuthentication < Sinatra::Base
        enable :raise_errors
        disable :show_exceptions

        helpers do
          def unauthorized_template
            @unauthenticated_template ||= File.read(File.join(File.dirname(__FILE__), "views", "401.html"))
          end
        end

        get '/unauthenticated' do
          status 403
          unauthorized_template
        end
      end

    end
  end
end
