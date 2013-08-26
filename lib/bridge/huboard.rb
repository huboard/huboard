require "active_support/core_ext/numeric/time"
require_relative "github/repos"
require_relative "github/assignees"
require_relative "github/labels"
require_relative "github/settings"
require_relative "github/issues"
require_relative "github/backlog"
require_relative "github/board"
require_relative "middleware"

require "addressable/uri"

class Huboard
       
  def self.column_pattern
    return /(^|\:\s{1})(?<id>\d+) *- *(?<name>.+)/ 
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

  class Client

    def initialize(access_token, params={})
      
        env[:request_headers].merge!('Accept' => "application/vnd.github.beta.full+json" )
      @connection_factory = ->(token = nil) {
        options = { :access_token => token || access_token }
        options = {} if(token.nil? && access_token.nil?)
        Ghee.new(options) do |conn|
          conn.use Faraday::Response::RaiseGheeError
          conn.use ClientId, params unless token || access_token
          conn.use Mimetype
          conn.request :retry, 3
          # disable cache because github api is broken
          conn.use Caching unless token || access_token
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
