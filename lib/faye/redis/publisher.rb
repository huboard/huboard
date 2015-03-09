module Faye
  class Redis
    class Publisher
      DEFAULT_HOST     = 'localhost'
      DEFAULT_PORT     = 6379
      DEFAULT_DATABASE = 0
      DEFAULT_GC       = 60
      LOCK_TIMEOUT     = 120

      def initialize(options)
        @options = options
        init
      end

      def init
        return if @redis

        uri      = @options[:uri]       || nil
        host     = @options[:host]      || DEFAULT_HOST
        port     = @options[:port]      || DEFAULT_PORT
        db       = @options[:database]  || DEFAULT_DATABASE
        auth     = @options[:password]  || nil
        @ns      = @options[:namespace] || ''
        @timeout = @options[:timeout] || 60

        if uri
          @redis = ::Redis.connect(url:uri)
        else
          @redis = ::Redis.connect({
            host:host, 
            port: port, 
            password: auth, 
            database: db,
            logger: Logger.new(STDOUT)
          })
        end

        @message_channel = @ns + '/notifications/messages'
        @close_channel   = @ns + '/notifications/close'
      end

      def publish(channel, payload)
        json_message = MultiJson.dump({ channel: channel, data: payload})
        channels = Channel.expand(channel)
        keys = channels.map { |c| @ns + "/channels#{c}" }

      
        clients = @redis.sunion(*keys)
        clients.each do |client_id|
          queue = @ns + "/clients/#{client_id}/messages"

          @redis.rpush(queue, json_message)
          @redis.publish(@message_channel, client_id)

          client_exists(client_id) do |exists|
            @redis.del(queue) unless exists
          end
        end
      end

      def client_exists(client_id, &callback)
        cutoff = get_current_time - (1000 * 1.6 * @timeout)

        score = @redis.zscore(@ns + '/clients', client_id)
        callback.call(score.to_i > cutoff)
      end

      private
      def get_current_time
       (Time.now.to_f * 1000).to_i 
      end

    end
  end
end


