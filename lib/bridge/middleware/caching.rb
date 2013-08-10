require 'forwardable'
require 'faraday_middleware/addressable_patch'

class Huboard
  class Client
    class SimpleCache

      def initialize(app, options)
        @options = options
        @app = app
      end

      def dalli
        @dalli ||= Dalli::Client.new(ENV["CACHE_SERVERS"] || "localhost:11211", @options)
      end

      def read(key, app, env)
        if cached = dalli.get(key.downcase)
          cached = Marshal.load(cached)
          etag =  cached.headers[:etag]
          env[:request_headers].merge!('If-None-Match' => etag)
          response = app.call(env)
          if response.status == 304
            puts "cache hit #{key}"
            return cached
          elsif response.status == 200
            puts "cache bust #{key}"
            write(key, response)
            return response
          end
          response
        else
          data = app.call(env)
          write(key, data)
          data
        end
      end

      def write(key, data)
        dalli.set(key.downcase, Marshal.dump(data))
        data
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
      def initialize(app, options = {:namespace => "huboard_v1", :compress => true, :username => ENV["CACHE_USERNAME"], :password => ENV["CACHE_PASSWORD"]})
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
        url.request_uri
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

