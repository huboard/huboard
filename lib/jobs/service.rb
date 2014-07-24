class Huboard
  module Caching
    class ConnectionPool
      def self.options
        @options ||= {
          namespace: "huboard_v1",
          compress: true,
          expires_in: 1.day,
          username: HuboardApplication.cache_config[:username],
          password: HuboardApplication.cache_config[:password]
        }
      end

      def self.connection_pool
        @connection_pool = ::ConnectionPool.new(size: 20, timeout: 3) {
          Dalli::Client.new(HuboardApplication.cache_config[:servers].split(","), options)
        }
      end
    end
  end

  class Service
    attr_accessor :event, :data, :payload

    def initialize(event, data, payload)
      @event = event.to_sym
      @data = data || {}
      @payload = payload
    end

    def self.services
      @services ||= []
    end

    def self.inherited(type)
      Service.services << type
      super
    end
  end
end

path = File.expand_path "../services/*.rb", __FILE__
Dir[path].each { |srv| require(srv) }
