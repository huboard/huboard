class Huboard

  module Config

    VALID_OPTIONS_KEYS = [
      :oauth_token,
      :faraday_config_block,
      :api_endpoint,
      :access_token

    ].freeze

    attr_accessor(*VALID_OPTIONS_KEYS)

    def configure
      yield self
    end

    def options
      VALID_OPTIONS_KEYS.inject({}){|o,k| o.merge!(k => send(k)) }
    end

    def api_endpoint=(value)
      @api_endpoint = File.join(value, "")
    end

    def faraday_config(&block)
      @faraday_config_block = block
    end

  end

  extend Config

end
