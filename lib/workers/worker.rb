require 'dotenv'
Dotenv.load

$: << File.expand_path('../', __FILE__)

require 'celluloid'
require 'redis'
require 'celluloid/redis'
require 'multi_json'
require 'hashie'


trap(:INT) {puts "Shutting down"; $redis.unsubscribe; exit }

$redis = Redis.connect driver: :celluloid
require 'segment/analytics'

Analytics = Segment::Analytics.new({
    write_key: ENV["SEGMENTIO_KEY"], 
    on_error: Proc.new { |status, msg| print msg }
}) 

begin
  puts ENV['REDIS_URL']

  $redis.psubscribe 'pubsub.*' do |on|
    on.psubscribe do

    end
    on.pmessage do |match, channel, msg|
      message = MultiJson.load msg
      hashie = Hashie::Mash.new message
      Analytics.identify(
        user_id: hashie.meta.user.id,
        traits: hashie.meta.user.to_hash
      )
      Analytics.track(
        user_id: hashie.meta.user.id,
        event: hashie.meta.action,
        properties: hashie.to_hash
      )
      Analytics.logger.info "Tracked: #{hashie.meta.action}"

    end
  end

rescue Redis::BaseConnectionError => error
  puts "#{error}, retrying in 1s"
  sleep 1
  retry
end


