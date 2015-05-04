#Rails.application.config.after_initialize do
#  ActiveRecord::Base.connection_pool.disconnect!
#
#  ActiveSupport.on_load(:active_record) do
#    if config = ActiveRecord::Base.configurations[Rails.env] || Rails.application.config.database_configuration[Rails.env]
#      config['reaping_frequency'] = ENV['DB_REAP_FREQ'] || 10 # seconds
#      config['pool']              = ENV['MAX_THREADS']      || 5
#      ActiveRecord::Base.establish_connection(config)
#    end
#  end
#end
defined?(Redis) and
  $redis = Redis.current = ConnectionPool::Wrapper.new( size: (ENV['MAX_THREADS'] || 5) ) { Redis.new( url: ENV['REDIS_URL'] ) }
