require_relative "github/config"
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

  class << self

    def client
      @gh ||= Ghee.new(:access_token => access_token) do |conn|
        faraday_config_block.call(conn) if faraday_config_block
      end
    end

    def adapter_for(user, repo)
      Board.new(user, repo)
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
