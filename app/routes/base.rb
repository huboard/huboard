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
        set :dump_errors, false
        set :show_exceptions, false
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

      get '/site/error' do
        erb :"500", layout: false
      end

      not_found do
        erb ([:"404",:"404a"].sample), layout: false
      end

      error Ghee::Unauthorized do
        throw(:warden, action: 'bad_credentials')
      end

      error do
        erb :"500", layout: false
      end
    end
  end
end
