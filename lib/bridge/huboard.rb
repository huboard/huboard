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


  module Config

    VALID_OPTIONS_KEYS = [
       :oauth_token,
       :faraday_config_block,
       :api_endpoint,
       :access_token

    ].freeze

    attr_accessor(*VALID_OPTIONS_KEYS)

    def configure
      yield self
    end

    def options
      VALID_OPTIONS_KEYS.inject({}){|o,k| o.merge!(k => send(k)) }
    end

    def api_endpoint=(value)
      @api_endpoint = File.join(value, "")
    end

    def faraday_config(&block)
      @faraday_config_block = block
    end

  end

  extend Config

  class << self

    def client
        @gh ||= Ghee.new(:access_token => access_token) do |conn|
          faraday_config_block.call(conn) if faraday_config_block
        end
    end

    def board_for(user, repo)
      Board.new(user, repo)
    end


  end


  module Repos

    def repos(org = nil)

      repos = org.nil? ? client.user.repos.all : client.orgs(org).repos.all

      repos.reject { |r| !r.has_issues }.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse

    end

    def all_repos
      the_repos = repos
      client.orgs.each do |org|
        the_repos.concat(repos(org.login))
      end
      the_repos.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end

    def repos_by_user(user)
       user = client.users user
       the_repos = repos(user.login) if user.type == "Organization"
       the_repos = user.repos.all.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse if user.type == "User"
       the_repos.reject { |r| !r.has_issues }.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end
     

  end

  extend Repos


  module Assignees
    def assignees
        gh.assignees.all
    end
  end
              

  module Labels

    def labels
      gh.labels
    end

    def other_labels
      labels.reject { |l| Huboard.all_patterns.any? {|p| p.match l.name } }
    end

    def settings_labels
      labels.select{|l| Huboard.settings_pattern.match l.name }
    end

    def column_labels
      labels.select{|l| Huboard.column_pattern.match l.name }
    end

    def link_labels
      labels.select{|l| Huboard.link_pattern.match l.name }
    end

  end

  module Settings

    def settings
      defaults = {
        :show_all => true
      }

      the_settings = settings_labels.map do |l|
        match = Huboard.settings_pattern.match l["name"]
        begin
          YAML.load(match[1])
        rescue
          return {}
        end
      end.reduce(:merge)

      defaults.merge(the_settings || {})

    end

  end

  class Board
    attr_accessor :user, :repo

    def initialize(user, repo, client = Huboard.client)
      @gh = client
      @user = user
      @repo = repo
    end

    def gh
      @gh.repos(user, repo)
    end


    include Assignees
    include Labels
    include Settings
  end

end
