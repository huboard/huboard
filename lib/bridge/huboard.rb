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

  module Issues

    def issues(label = nil)
      params = {:direction => "asc"}
      params = params.merge({:labels => label}) if label
      gh.issues(params).all.each{|i| i.extend(Card)}.each{ |i| i.merge!({"repo" => {:owner => {:login => user}, :name => repo }}) }.sort_by { |i| i["_data"]["order"] || i["number"].to_f}
    end

    def issue(number)
      gh.issues(number).extend(Card).merge!({:repo => {:owner => {:login => user}, :name => repo }})
    end

    module Card

      def current_state
        r = Huboard.column_pattern
        self.labels.sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}  || {"name" => "__nil__"}
      end

      def update_labels(labels)

        keep_labels = self.labels.find_all {|l| Huboard.all_patterns.any? {|p| p.match(l.name)}}

        update_with = labels.concat(keep_labels.map{ |l| l["name"] }) 

        patch "labels" => update_with

      end

      def other_labels
        self.labels.reject {|l| Huboard.all_patterns.any? {|p| p.match l.name }}
      end

      def client
        Huboard.client.repos(self[:repo][:owner][:login], self[:repo][:name]).issues(self.number)
      end

      def patch(hash)
        updated = client.patch hash 
        updated.extend(Card).merge!(:repo => repo)
      end

      def move(index)
        board = Huboard.board_for(self[:repo][:owner][:login], self[:repo][:name])
        column_labels = board.column_labels
        new_state = column_labels.find { |l| /#{index}\s*- *.+/.match l.name }
          self.labels << new_state unless new_state.nil?
        self.labels = self.labels.delete_if { |l| l["name"] == self[:current_state]["name"]}
        patch "labels" => self.labels
      end

      def close
        status = client.close
        return :success => status
      end

      def reorder(index)
        embed_data({"order" => index.to_f})
        patch :body => self.body
      end

      def embed_data(data = nil)
        if !data
          r = /@huboard:(.*)/
            match = r.match self.body
          return { } if match.nil?

          begin
            return JSON.load(match[1])
          rescue
            return {}
          end
        else
          _data = embed_data
          if _data.empty?
            self.body = self.body.concat  "\r\n\r\n<!---\r\n@huboard:#{JSON.dump(data)}\r\n-->\r\n" 
          else
            self.body = self.body.gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge(data))}"
          end
        end
      end

      def self.extended(klass)
        klass[:current_state] = klass.current_state
        klass[:other_labels] = klass.other_labels
        klass["_data"] = klass.embed_data
      end

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
    include Issues
  end

end
