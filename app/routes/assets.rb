module HuBoard
  module Routes
    class Assets < Sinatra::Application
      configure do
        set :root, File.expand_path('../../../', __FILE__)

        disable :method_override
        disable :protection
        disable :static
      end

      register Extensions::Assets

      get '/assets/*' do
        env['PATH_INFO'].sub!(%r{^/assets}, '')
        settings.assets.call(env)
      end
    end
  end
end
