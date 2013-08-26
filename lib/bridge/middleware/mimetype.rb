class Huboard
  class Client
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
        env[:request][:timeout] = 2 
        env[:request][:open_timeout] = 0.5

        @app.call env
      end
    end
  end
end
