require 'rubygems'
require 'bundler'

# Setup load paths
Bundler.require
$: << File.expand_path('../', __FILE__)
$: << File.expand_path('../lib', __FILE__)

require 'dotenv'
Dotenv.load

# Require base
require 'sinatra/base'
require 'active_support/core_ext/string'
require 'active_support/core_ext/array'
require 'active_support/core_ext/hash'
require 'active_support/json'

libraries = Dir[File.expand_path('../lib/bridge/**/*.rb', __FILE__)]
libraries.each do |path_name|
  require path_name
end

require 'lib/auth/github'

require 'app/extensions'
require 'app/helpers'
require 'app/routes'

module HuBoard
  class App < Sinatra::Application

    GITHUB_CONFIG = {
      :client_id     => ENV['GITHUB_CLIENT_ID'],
      :client_secret => ENV['GITHUB_SECRET'],
      :scope => "public_repo"
    }

    configure do
      disable :method_override
      disable :static

      set :erb, escape_html: true

      set :session_secret, ENV["SESSION_SECRET"]
      set :sessions,
          key: 'rack.session',
          path: '/',
          httponly: true,
          expire_after: 5.years,
          secret: ENV['SESSION_SECRET']

      set :cache_config, {
        servers: ENV["CACHE_SERVERS"] = ENV["MEMCACHIER_SERVERS"],
        username: ENV["CACHE_USERNAME"] = ENV["MEMCACHIER_USERNAME"],
        password: ENV["CACHE_PASSWORD"] = ENV["MEMCACHIER_PASSWORD"]
      }

      set :socket_backend, ENV["SOCKET_BACKEND"]
      set :socket_secret, ENV["SOCKET_SECRET"]

      set :server_origin, {
        scheme: ENV["HTTP_URL_SCHEME"] || "https",
        host: ENV["HTTP_HOST"] || "huboard.com"
      }
    end

    use Warden::Manager do |config|
      config.failure_app = Sinatra::Auth::Github::BadAuthentication
      config.default_strategies :github
      config.scope_defaults :default, :config => GITHUB_CONFIG
      config.scope_defaults :private, :config => GITHUB_CONFIG.merge(:scope => 'repo')
    end

    use Rack::Deflater
    use Rack::Standards

    use Routes::Static

    unless settings.production?
      use Routes::Assets
    end

    use Routes::Marketing
    use Routes::Login

    # API routes
    use Routes::Api::Board

    # App routes
    use Routes::Repositories

  end
end
class HuboardApplication < HuBoard::App; end
