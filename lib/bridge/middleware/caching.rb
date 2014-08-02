require 'dalli'
require 'forwardable'
require 'faraday_middleware/addressable_patch'
require 'digest/md5'
require 'connection_pool'

class Huboard
  class Client
    class SimpleCache

      def initialize(app, options)
        @options = options
        @app = app
      end

      def cache
        @dalli ||= HuBoard.cache
      end

      def logger
        cache.logger
      end

      def clear(key)
        cache.with do |dalli|
          dalli.delete(key)
        end
      end

      def read(key, app, env)
        if cached = get(key)
          cached = Marshal.load(cached)
          etag =  cached.headers[:etag]

          env[:request_headers].merge!('If-None-Match' => etag)

          response = app.call(env)

          if response.status == 304
            logger.debug("Cache hit: #{key}")
            return cached
          elsif response.status == 200
            write(key, response)
            return response
          end
          response
        else
          data = app.call(env)
          if data.status == 200
            write(key, data)
          end
          data
        end
      end

      def get(key)
        cache.with do |dalli|
          logger.debug("Cache read: #{key}")
          dalli.get(key)
        end
      end

      def write(key, data)
        cache.with do |dalli|
          logger.debug("Cache write: #{key}")
          dalli.set(key, Marshal.dump(data))
          data
        end
      end

      def fetch(key, app, env)
        read(key, app, env)
      end
    end

    class Caching < Faraday::Middleware
      attr_reader :cache

      extend Forwardable
      def_delegators :'Faraday::Utils', :parse_query, :build_query

      # Public: initialize the middleware.
      #
      # cache   - An object that responds to read, write and fetch (default: nil).
      # options - An options Hash (default: {}):
      #           :ignore_params - String name or Array names of query params
      #                            that should be ignored when forming the cache
      #                            key (default: []).
      #
      # Yields if no cache is given. The block should return a cache object.
      def initialize(app, options = {:namespace => "huboard_v1", :compress => true, :expires_in => 1.day,
                                     :username => HuboardApplication.cache_config[:username], :password => HuboardApplication.cache_config[:password]})
        super(app)
        @cache = SimpleCache.new app, options
        @options = options
      end

      def call(env)
        if :get == env[:method]
          if env[:parallel_manager]
            # callback mode
            cache_on_complete(env)
          else
            # synchronous mode
            response = cache.fetch(cache_key(env), @app, env)
            finalize_response(response, env)
          end
        elsif :patch == env[:method] || :post == env[:method] || :delete == env[:method]
          cache.clear(cache_key(env))
          @app.call(env)
        else
          @app.call(env)
        end
      end

      def cache_key(env)
        url = env[:url].dup
        if url.query && params_to_ignore.any?
          params = parse_query url.query
          params.reject! {|k,| params_to_ignore.include? k }
          url.query = build_query params
        end
        url.normalize!
        Digest::MD5.hexdigest(url.request_uri)
      end

      def params_to_ignore
        @params_to_ignore ||= Array(@options[:ignore_params]).map { |p| p.to_s }
      end

      def cache_on_complete(env)
        key = cache_key(env)
        if cached_response = cache.read(key, @app, env)
          finalize_response(cached_response, env)
        else
          response = @app.call(env)
          response.on_complete { cache.write(key, response) }
        end
      end

      def finalize_response(response, env)
        response = response.dup if response.frozen?
        env[:response] = response
        unless env[:response_headers]
          env.update response.env
          # FIXME: omg hax
          response.instance_variable_set('@env', env)
        end
        response
      end
    end
  end
end
