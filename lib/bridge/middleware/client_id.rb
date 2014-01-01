class Huboard
  class Client
    class ClientId < Faraday::Middleware
      begin

      rescue LoadError, NameError => e
        self.load_error = e
      end

      def initialize(app, params={})
        @app = app
        @params = params
      end



      def call(env)

        uri = Addressable::URI.parse(env[:url].to_s)

        uri.query_values = uri.query_values.merge(@params) if uri.query_values
        uri.query_values = @params unless uri.query_values

        env[:url] = URI::parse(uri.to_s)

        @app.call env
      end

    end
  end
end

