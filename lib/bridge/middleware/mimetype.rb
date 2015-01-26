class Huboard
  class Client
    class Mimetype < Faraday::Middleware
      def initialize(app, *args)
        @app = app
      end

      def call(env)
        #TODO Remove request headers check for moondragon once Github API come into effect ~Feb 20/15
        env[:request_headers].merge!('Accept' => "application/vnd.github.v3.full+json" ) unless env[:request_headers]["Accept"] == "application/vnd.github.moondragon+json"
        env[:request][:timeout] = 3
        env[:request][:open_timeout] = HuboardApplication.production? ? 0.7 : 10

        @app.call env
      end
    end
  end
end
