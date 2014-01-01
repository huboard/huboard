require 'sinatra/base'
require 'warden/github'
require 'sinatra/asset_pipeline'

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

        set :assets_precompile, %w(splash.css marketing.css application.js flex_layout.css bootstrap.css application.css ember-accounts.js board/application.js bootstrap.js *.png *.jpg *.svg *.eot *.ttf *.woff *.js).concat([/\w+\.(?!js|css).+/, /application.(css|js)$/])

        register Sinatra::AssetPipeline

        configure :production, :staging do 
          sprockets.js_compressor = :uglify
          sprockets.css_compressor = :scss
        end

        get '/unauthenticated' do
          status 403
          erb :"401"
        end
      end

    end
  end
end
