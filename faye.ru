require 'bundler'
Bundler.require

require 'dotenv'
Dotenv.load

require 'faye'

options = {
  mount: '/site/pubsub',
  timeout: 10,
  ping: 5,
  engine: {
    type: Faye::Redis,
    uri: (ENV['REDIS_URL'] || 'redis://localhost:6379')
  }
}

run Faye::RackAdapter.new(options)

require 'logger'
Faye.logger = Logger.new(STDOUT)
Faye.logger.level = Logger::INFO

