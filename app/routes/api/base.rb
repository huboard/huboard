module HuBoard
  module Routes
    module Api
      class Base < Sinatra::Application
        configure do
          set :views, 'app/views'
          set :root, File.expand_path('../../../', __FILE__)

          disable :method_override
          disable :protection
          disable :static

          set :erb, 
                    layout_options: {views: 'app/views/layouts'}

          enable :use_code
        end

        helpers Helpers

      end
    end
  end
end

