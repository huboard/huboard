require 'ghee'

#require 'rack-cache'
#require 'active_support/cache'
require_relative 'bridge/huboard'
require_relative 'couch/client'

class Huboard
  module Common
    module Helpers

      def couch
        @couch ||= Huboard::Couch.new :base_url => ENV["COUCH_URL"], :database => ENV["COUCH_DATABASE"]
      end

      def encrypted_token
        encrypted = encrypt_token
        Base64.urlsafe_encode64 encrypted if encrypted
      end

      def encrypt_token
        Encryptor.encrypt user_token, :key => settings.secret_key if user_token
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
        github_user
      end

      # The authenticated user object
      #
      # Supports a variety of methods, name, full_name, email, etc
      def github_user
        warden.user(:private) || warden.user || Hashie::Mash.new
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
        Huboard::Client.new(token || user_token, github_config)
      end

      def gh(token = nil)
        huboard(token).connection
      end

      def socket_backend
        return settings.socket_backend if settings.respond_to? :socket_backend
      end

      def publish(channel,event,payload)
        return if socket_backend.nil?
        begin
          conn = Faraday.post do |req|
            req.url "#{socket_backend}/hook"
            req.headers['Content-Type'] = 'application/json'
            req.body =  json({channel:channel, payload:{ payload:payload, event:event, correlationId: params[:correlationId] || "herpderp"},secret:settings.socket_secret})
          end
        rescue
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
  end
end
