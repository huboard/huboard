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
      app.use Rack::Session::Cookie, :key => 'rack.session', :path => '/', :secret => settings.session_secret
      app.set :views, settings.root + "/views"
    end

  end
end
