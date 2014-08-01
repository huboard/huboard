require 'memcachier'

# Require base
require 'sinatra/base'
require 'active_support/all'
require 'active_support/core_ext/string'
require 'active_support/core_ext/array'
require 'active_support/core_ext/hash'
require 'active_support/json'
require 'active_support/cache/dalli_store'
require 'active_support/number_helper'

%w{ bridge couch }.each do |folder|
  libraries = Dir[File.expand_path("../lib/#{folder}/**/*.rb", __FILE__)]
  libraries.each do |path_name|
    require path_name
  end
end
require 'jobs'

require 'app/extensions'
require 'app/helpers'
require 'app/routes'

module HuBoard
  class << self
    attr_accessor :cache

  end
  unless HuBoard.cache
    HuBoard.cache = ActiveSupport::Cache.lookup_store(:dalli_store,
                                                      (ENV["CACHE_SERVERS"] || "").split(","),
                                                      {:username              => ENV["MEMCACHE_USERNAME"],
                                                        :password             => ENV["MEMCACHE_PASSWORD"],
                                                        :pool_size                 => 5,
                                                        :failover             => true,
                                                        :socket_timeout       => 1.5,
                                                        :socket_failure_delay => 0.2
                                                      })
  end


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
          secure: HuBoard.sass? && settings.production?,
          httponly: true,
          expire_after: 5.years,
          secret: ENV['SESSION_SECRET']

      set :cache_config, {
        servers: ENV["MEMCACHE_SERVERS"],
        username: ENV["MEMCACHE_USERNAME"],
        password: ENV["MEMCACHE_PASSWORD"]
      }

      set :socket_backend, ENV["SOCKET_BACKEND"]
      set :socket_secret, ENV["SOCKET_SECRET"]

      set :server_origin, {
        scheme: ENV["HTTP_URL_SCHEME"] || "https",
        host: ENV["HTTP_HOST"] || "huboard.com"
      }
    end

    use Warden::Manager do |config|
      config.failure_app = HuBoard::Routes::Failure
      config.default_strategies :github
      config.scope_defaults :default, :config => GITHUB_CONFIG
      config.scope_defaults :private, :config => GITHUB_CONFIG.merge(:scope => 'repo')
    end

    use Rack::Deflater
    use Rack::Standards

    use PDFKit::Middleware, {print_media_type: true}, only: %r[^/settings]
    use Routes::Static

    unless settings.production?
      use Routes::Assets
    end

    if HuBoard.sass?
      use Routes::Marketing
    end
    use Routes::Login

    # API routes
    use Routes::Api::Board
    use Routes::Api::Issues
    use Routes::Api::Integrations
    use Routes::Api::Webhooks

    if HuBoard.sass?
      use Routes::Api::Profiles
      use Routes::Profiles
    end

    use Routes::Fallback
    use Routes::Repositories

  end
end

class HuboardApplication < HuBoard::App; end
