require_relative "github/repos"
require_relative "github/assignees"
require_relative "github/labels"
require_relative "github/settings"
require_relative "github/issues"
require_relative "github/backlog"
require_relative "github/board"

require "addressable/uri"

class Huboard

  def self.column_pattern
    return /^(?<id>\d+) *- *(?<name>.+)/ 
  end

  def self.link_pattern
    return /^Link <=> (?<user_name>.*)\/(?<repo>.*)/
  end

  def self.settings_pattern
    return /^@huboard:(.*)/
  end

  def self.all_patterns
    [self.column_pattern, self.link_pattern, self.settings_pattern]
  end

  class SimpleCache < Hash
    def read(key)
      if cached = self[key]
        puts "cache:read #{key}"
        p cached
      end
    end

    def write(key, data)
      puts "cache:write #{key}"
      self[key] = data
    end

    def fetch(key)
      puts "cache:fetch #{key}"
      read(key) || yield.tap { |data| write(key, data) }
    end
  end

  class Client
    class Mimetype < Faraday::Middleware
      begin

      rescue LoadError, NameError => e
        self.load_error = e
      end

      def initialize(app, *args)
        @app = app
      end



      def call(env)

        env[:request_headers].merge!('Accept' => "application/vnd.github.beta.full+json" )

        @app.call env
      end
    end


    class ClientId < Faraday::Middleware
      begin

      rescue LoadError, NameError => e
        self.load_error = e
      end

      def initialize(app, params={})
        @app = app
        @params = params
      end



      def call(env)

        uri = Addressable::URI.parse(env[:url].to_s)

        uri.query_values = uri.query_values.merge(@params) if uri.query_values
        uri.query_values = @params unless uri.query_values

        env[:url] = URI::parse(uri.to_s)

        @app.call env
      end
    end

    def initialize(access_token, params={})
      @cache = SimpleCache.new
      
      @connection_factory = ->(token = nil) {
        options = { :access_token => token || access_token }
        options = {} if(token.nil? && access_token.nil?)
        Ghee.new(options) do |conn|
          conn.use FaradayMiddleware::Caching, @cache 
          conn.use Mimetype
          conn.use ClientId, params unless token || access_token
        end
      }
    end

    def connection
      @connection_factory.call
    end

    def board(user, repo)
      Board.new(user, repo, @connection_factory)
    end

  end

  class Board
    include Assignees
    include Labels
    include Settings
    include Issues
    include Backlog
  end

end
