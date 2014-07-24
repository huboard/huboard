module HuBoard
  extend self

  def sass?
    true
  end
end

module Rack
  class NonSSL
    def initialize(app)
      @app = app
    end

    def call(env)
      if scheme(env) == "http"
         @app.call(env)
      else
        redirect_to_http(env)
      end
    end

    private
    # Fixed in rack >= 1.3
    def scheme(env)
      if env['HTTPS'] == 'on'
        'https'
      elsif env['HTTP_X_FORWARDED_PROTO']
        env['HTTP_X_FORWARDED_PROTO'].split(',')[0]
      else
        env['rack.url_scheme']
      end
    end

    def redirect_to_http(env)
      req = Request.new(env)

      host = @host || req.host
      location = "http://#{host}#{req.fullpath}"

      status  = %w[GET HEAD].include?(req.request_method) ? 301 : 307
      headers = { 'Content-Type' => 'text/html', 'Location' => location }

      [status, headers, []]
    end


  end
end
