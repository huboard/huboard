module HuBoard
  module Routes
    class Base < Sinatra::Application
      configure do
        set :views, 'app/views'
        set :root, File.expand_path('../../../', __FILE__)

        disable :method_override
        disable :protection
        disable :static

        set :erb, layout_options: {views: 'app/views/layouts'}

        enable :use_code
        set :raise_errors, true
      end

      helpers do
        set(:is_logged_in) do |enabled|
          condition do
            enabled == logged_in?
          end
        end
      end

      register Extensions::Assets
      helpers Helpers
      helpers Sinatra::ContentFor
      helpers Sinatra::Partials

      not_found do
        erb :"404", layout: false
      end
    end
  end
end
