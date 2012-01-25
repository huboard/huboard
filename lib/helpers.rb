require 'ghee'
module Huboard
  module Common

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

      def protected!
        redirect '/auth/github' unless logged_in?
      end

      def github
        @github ||= Stint::Github.new({ :headers => {"Authorization" => "token #{user_token}"}},gh)
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
      app.enable :sessions
      app.set :views, settings.root + "/views"
    end

  end
end
