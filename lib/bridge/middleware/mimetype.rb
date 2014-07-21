class Huboard
  class Client
    class Mimetype < Faraday::Middleware
      def initialize(app, *args)
        @app = app
      end

      def call(env)
        env[:request_headers].merge!('Accept' => "application/vnd.github.v3.full+json" )
        env[:request][:timeout] = 3
        env[:request][:open_timeout] = HuboardApplication.production? ? 0.7 : 3

        @app.call env
      end
    end
  end
end
