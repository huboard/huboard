require "time"
require "hashie"

class Module
  def overridable(&blk)
    mod = Module.new(&blk)
    include mod
  end
end

class Huboard
  module Issues
    def issues(label = nil)
      params = {direction: "asc"}
      params = params.merge(labels: label) if label

      gh.issues(params).all.each{
        |i| i.extend(Card)
      }.each{ |i|
        i.merge!("repo" => {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })
      }.sort_by { |i| i["_data"]["order"] || i["number"].to_f }
    end

    def archive_issue(number)
      issue = gh.issues(number)
      labels = issue.labels.all.reject {|l| Huboard.all_patterns.any? {|p| p.match l.name }}.sort_by {|l| l.name}

      gh.issues(number).patch(labels: labels).extend(Card).merge!("repo" => {owner: {login: @user}, name: @repo,  full_name: "#{@user}/#{@repo}" })
    end

    def create_issue(params)
      issue = Hashie::Mash.new params["issue"]
      issue.extend(Card).embed_data params["order"]

      milestone = issue["milestone"].nil? ? nil : issue.milestone.number
      assignee = issue["assignee"].nil? ? nil : issue.assignee.login

      labels = column_labels

      attributes = {
        title: issue.title,
        body: issue.body,
        labels: [labels.first.name].concat((issue.labels || []).map{|l| l["name"]}),
        assignee: assignee,
        milestone: milestone
      }

      result = gh.issues.create(attributes).extend(Card).merge!("repo" => {owner: {login: @user}, name: @repo,  full_name: "#{@user}/#{@repo}" })

      result.current_state = labels.first if result.current_state["name"] == "__nil__"

      result
    end

    def closed_issues(label, since = (Time.now - 2*7*24*60*60).utc.iso8601)
      params = {labels: label, state: "closed", since: since, per_page: 30}

      gh.issues(params).each{|i| i.extend(Card)}.each{ |i| i.merge!("repo" => {owner: {login: user}, name: repo,  full_name: "#{user}/#{repo}" }) }.sort_by { |i| i["_data"]["order"] || i["number"].to_f }
    end

    def issue(number)
      raise "number is nil" unless number

      issue = gh.issues(number).extend(Card).merge!(repo: {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })
      issue.attach_client connection_factory
      issue
    end

    def milestones
      gh.milestones.all.each { |m| m.extend(Milestone) }.each{ |i| i.merge!("repo" => {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" }) }.sort_by { |i| i["_data"]["order"] || i["number"].to_f }
    end

    def milestone(number)
      milestone = gh.milestones(number).extend(Milestone).merge!(repo: {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })
      milestone.attach_client connection_factory
      milestone
    end

    def create_milestone(milestone)
      gh.milestones.create(milestone).extend(Milestone).merge!(repo: {owner: {login: user}, name: repo, full_name: "#{user}/#{repo}" })
    end

    module Card
      def current_state
        r = Huboard.column_pattern
        nil_label = {"name" => "__nil__"}

        begin
          self.labels.sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}.extend(Huboard::Labels::ColumnLabel)  || nil_label
        rescue
          nil_label
        end
      end

      def order
        self["_data"]["order"] || self.number.to_f
      end

      def update(params)
        if params["labels"]
          keep_labels = self.labels.find_all {|l| Huboard.all_patterns.any? {|p| p.match(l.name)}}

          update_with = params["labels"].concat(keep_labels.map{|l| l.to_hash} )

          params["labels"] = update_with
        end

        patch(params).extend(Card)
      end


      def other_labels
        begin
          self.labels.reject {|l| Huboard.all_patterns.any? {|p| p.match l.name }}.sort_by {|l| l.name}
        rescue
          []
        end
      end

      def attach_client connection
        @connection_factory = connection
      end

      def gh
        @connection_factory.call
      end

      def client
        gh.repos(self[:repo][:owner][:login], self[:repo][:name]).issues(self.number)
      end

      def events
        client.events.all.to_a
      end

      def all_comments
        client.comments.all.to_a
      end

      def feed
        the_feed =  { :comments => self.all_comments, :events => events }
        self.merge! the_feed
      end

      def activities
        the_feed =  { :comments => self.all_comments, :events => events }
        self.merge! :activities => the_feed
      end

      def patch(hash)
        hash["labels"] = hash["labels"].map {|l| l["name"] } if hash["labels"]
        updated = client.patch hash
        updated.extend(Card).merge!(:repo => repo)
      end

      overridable do
        def move(index, order=nil, moved = false)
          board = Huboard::Board.new(self[:repo][:owner][:login], self[:repo][:name], @connection_factory)
          column_labels = board.column_labels
          self.labels = [] if self.labels.nil?
          self.labels = self.labels.delete_if { |l| Huboard.column_pattern.match l.name }
          regex = /#{index}\s*- *.+/ # TODO what does this regex do?
          new_state = column_labels.find { |l| regex.match l.name }
          self.labels << new_state unless new_state.nil?
          embed_data({"order" => order.to_f}) if order
          embed_data({"custom_state" => ""}) if moved
          patch "labels" => self.labels, "body" => self.body
        end
      end

      def close
        patch state: "closed"
      end

      def reorder(index)
        embed_data({"order" => index.to_f, "custom_state" => ""})

        patch body: self.body
      end

      %w{blocked ready}.each do |method|
        define_method method do
          embed_data({"custom_state" => method})

          patch body: self.body
        end

        define_method "un#{method}" do
          embed_data({"custom_state" => ""})

          patch body: self.body
        end
      end

      def embed_data(data = nil)
        r = /@huboard:(.*)/
        if !data
          match = r.match(self.body || "")
          return { order: self.number, milestone_order: self.number } if match.nil?

          begin
            data = MultiJson.load(match[1])
            data["order"] = self.number unless data["order"]
            data["milestone_order"] = self.number unless data["milestone_order"]
            return data
          rescue
            return { order: self.number, milestone_order: self.number }
          end
        else
          _data = embed_data
          if r.match self.body
            self.body = self.body.to_s.gsub /@huboard:.*/, "@huboard:#{MultiJson.dump(_data.merge(data))}"
          else
            self.body = self.body.to_s.concat  "\r\n\r\n<!---\r\n@huboard:#{MultiJson.dump(data)}\r\n-->\r\n" 
          end
        end
      end

      def number_searchable
        number.to_s
      end

      def self.extended(klass)
        klass[:current_state] = klass.current_state
        klass[:number_searchable] = klass.number_searchable
        klass[:other_labels] = klass.other_labels
        klass["_data"] = klass.embed_data
      end
    end

    module Milestone
      def reorder(index)
        embed_data({"order" => index.to_f})

        patch :description => self.description
      end

      def attach_client connection
        @connection_factory = connection
      end

      def gh
        @connection_factory.call
      end

      def client
        gh.repos(self[:repo][:owner][:login], self[:repo][:name]).milestones(self.number)
      end

      def patch(hash)
        m = client.patch hash
        m.extend(Milestone).merge! :repo => self["repo"]
      end

      def embed_data(data = nil)
        r = /@huboard:(.*)/
        if !data
          match = r.match(self.description || "")
          return { order: self.number } if match.nil?

          begin
            data = MultiJson.load(match[1])
            data["order"] = self.number unless data["order"]
            return data
          rescue
            return { order: self.number }
          end
        else
          _data = embed_data
          if r.match self.description
            self.description = self.description.to_s.gsub /@huboard:.*/, "@huboard:#{MultiJson.dump(_data.merge(data))}"
          else
            self.description = self.description.to_s.concat  "\r\n\r\n<!---\r\n@huboard:#{MultiJson.dump(data)}\r\n-->\r\n" 
          end
        end
      end

      def self.extended(klass)
        klass["_data"] = klass.embed_data
      end
    end
  end
end
