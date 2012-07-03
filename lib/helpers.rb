require 'ghee'
module Huboard
  module Common
    module Settings

      def self.extended(klass)
        klass.class_eval <<-RUBY, __FILE__, __LINE__ + 1
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
            else
              raise "Configuration information not found: you need to provide a .settings file or ENV variables"
            end
        RUBY
      end
    end

    module Helpers
      def encrypted_token
        encrypted = Encryptor.encrypt user_token, :key => settings.secret_key
        Base64.urlsafe_encode64 encrypted
      end

      def user_token
        github_user.token
      end

      def decrypt_token(token)
        decoded = Base64.urlsafe_decode64 token
        Encryptor.decrypt decoded, :key => settings.secret_key
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
        @pebble ||= Stint::Pebble.new(github)
      end

      def gh
        @gh ||= Ghee.new(:access_token => user_token)
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
