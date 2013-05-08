require_relative "github/repos"
require_relative "github/assignees"
require_relative "github/labels"
require_relative "github/settings"
require_relative "github/issues"
require_relative "github/backlog"
require_relative "github/board"

class Huboard

  def self.column_pattern
    return /(?<id>\d+) *- *(?<name>.+)/ 
  end

  def self.link_pattern
    return /Link <=> (?<user_name>.*)\/(?<repo>.*)/
  end

  def self.settings_pattern
    return /@huboard:(.*)/
  end

  def self.all_patterns
    [self.column_pattern, self.link_pattern, self.settings_pattern]
  end

  class SimpleCache < Hash
    def read(key)
      if cached = self[key]
        cached
      end
    end

    def write(key, data)
      self[key] = data
    end

    def fetch(key)
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


    def initialize(access_token)
      @cache = SimpleCache.new
      @connection_factory = ->(token = nil) {
          Ghee.new(:access_token => token || access_token) do |conn|
            conn.use FaradayMiddleware::Caching, @cache 
            conn.use Mimetype
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
