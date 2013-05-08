require 'ghee'
#require 'rack-cache'
#require 'active_support/cache'
require_relative 'bridge/huboard'

class Huboard
  module Common
    module Settings

      def self.extended(klass)
        klass.class_eval <<-RUBY, __FILE__, __LINE__ + 1

            enable :sessions
            if File.exists? "#{File.dirname(__FILE__)}/../.settings"
              puts "settings file"
              token_file =  File.new("#{File.dirname(__FILE__)}/../.settings")
              # TODO: read this from a yaml
              eval(token_file.read) 
            elsif ENV['GITHUB_CLIENT_ID']
              set :secret_key, ENV['SECRET_KEY']
              set :team_id, ENV["TEAM_ID"]
              set :user_name, ENV["USER_NAME"]
              set :password, ENV["PASSWORD"]
              set :github_options, {
                :secret    => ENV['GITHUB_SECRET'],
                :client_id => ENV['GITHUB_CLIENT_ID'],
                :scopes => "user,repo"
              }
              set :session_secret, ENV["SESSION_SECRET"]
              set :socket_backend, ENV["SOCKET_BACKEND"]
              set :socket_secret, ENV["SOCKET_SECRET"]

            else
              raise "Configuration information not found: you need to provide a .settings file or ENV variables"
            end
        RUBY
      end
    end
    class SimpleCache < Hash
      def read(key)
        if cached = self[key]
          cached
        end
      end

      def write(key, data)
        self[key] = data
      end

      def fetch(key)
        read(key) || yield.tap { |data| write(key, data) }
      end
    end

    class Mimetype < Faraday::Middleware
      begin

      rescue LoadError, NameError => e
        self.load_error = e
      end

      def initialize(app, *args)
        @app = app
      end



      def call(env)

        env[:request_headers].merge!('Accept' => "application/vnd.github.beta.full+json" )

        @app.call env
      end
    end

    module Helpers
      def encrypted_token
        encrypted = encrypt_token
        Base64.urlsafe_encode64 encrypted
      end

      def encrypt_token
        Encryptor.encrypt user_token, :key => settings.secret_key
      end

      def user_token
        github_user.token
      end

      def decrypt_token(token)
        decoded = Base64.urlsafe_decode64 token
        Encryptor.decrypt decoded, :key => settings.secret_key
      end

      def check_token(token)
        ghee = gh token
        ghee.connection.get('/').status == 200
      end

      def current_user
        @user ||= warden.user
      end

      def logged_in?
        !!user_token
      end

      def cache
        @cache ||= SimpleCache.new
        #@cache ||= ActiveSupport::Cache::FileStore.new "tmp", :namespace => 'huboard', :expires_in => 3600
      end

      def github
        @github ||= Stint::Github.new(gh) 
      end

      def pebble
        @pebble ||= Stint::Pebble.new(github, huboard)
      end

      def h(input = "")
        ERB::Util.html_escape input
      end

      def huboard(token = nil)
        Huboard::Client.new token || user_token
      end

      def gh(token = nil)
        huboard.connection
      end

      def configure_gh(token = nil)
        Huboard.configure do |client|
          client.api_endpoint = ENV['GITHUB_API_ENDPOINT'] || 'https://api.github.com'

          client.faraday_config do |conn|
            conn.use FaradayMiddleware::Caching, cache 
            conn.use Mimetype
          end
          
          client.access_token = token || user_token
        end

      end

      def socket_backend
        return settings.socket_backend if settings.respond_to? :socket_backend
      end

      def publish(channel,event,payload)
        return if socket_backend.nil?
        conn = Faraday.post do |req| 
          req.url "#{socket_backend}/hook"
          req.headers['Content-Type'] = 'application/json'
          req.body =  json({channel:channel, payload:{ payload:payload, event:event, correlationId: params[:correlationId] || "herpderp"},secret:settings.socket_secret,})
        end
      end

      def json(obj)
        content_type :json
        JSON.pretty_generate(obj)
      end

      def base_url
        @base_url ||= "#{request.env['rack.url_scheme']}://#{request.env['HTTP_HOST']}"
      end

      def team_id
        settings.team_id
      end
    end

    def self.registered(app)
      app.helpers Huboard::Common::Helpers
      app.use Rack::Session::Cookie, :key => 'rack.session', :path => '/'
      app.set :views, settings.root + "/views"
    end

  end
end
