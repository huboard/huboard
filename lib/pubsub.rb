require "faye/redis/publisher"
  module HuBoard
    class Faye
      include Singleton
      def initialize
        @client = ::Faye::Redis::Publisher.new({uri: ENV["REDIS_URL"]})
      end

      def publish(channel, payload)
        puts "===> PUBLISH #{channel}"
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
