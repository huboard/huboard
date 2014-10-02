  module HuBoard
    class Faye
      include Singleton
      def initialize
        @client = ::Faye::Client.new(::Faye::Server.new({
          mount: '/site/pubsub',
          timeout: 25,
          ping: 15,
          engine: {
            type: ::Faye::Redis,
            uri: (ENV['REDIS_URL'] || 'redis://localhost:6379')
          }
        }))
      end

      def publish(channel, payload)
        @client.publish channel, payload
      end

    end
    module PubSub extend self
      def publish(channel, payload)
        client = ::Redis.connect
        client.publish "pubsub.#{channel}", payload.to_json
        client.publish "elasticsearch", payload.to_json
        HuBoard::Faye.instance.publish "/" + channel, payload
      end

    end
  end
