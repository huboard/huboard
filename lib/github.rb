require 'httparty'

module Dashboard

  class Pebble
    attr_accessor :github

    def initialize(github)
      @github = github
    end

    def board(user_name = "DovetailSoftware", repo = "blue")
      issues = github.get_issues(user_name, repo)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }

      all_labels = github.labels(user_name, repo)

      all_labels = all_labels.map do |label|
        x = issues_by_label[label[:name]]
        label[:issues] = x || []
        label
      end

      {
        labels: all_labels
      }
    end

    def self.register(command, &block)
       @@sub ||= {}
       @@sub[command] = block
    end

    def self.deliver(payload)
      consumers = @@sub
      r = /^(?<command>[A-Z]+) GH-(?<issue>[0-9]+)/
        payload["commits"].each do |c|
          match = r.match c["message"]
          next if r.match match.nil?
          next unless consumers.has_key? match[:command]
          consumers[match[:command]].call payload, match[:issue] 
        end
    end
  end

  class Github 
    include HTTParty
    format :json
    base_uri "https://api.github.com/repos" 

    def initialize(oauth_token=nil)
      @oauth_token = oauth_token
    end

    def milestones(user_name = "DovetailSoftware", repo = "blue")
      response = get_issues(user_name, repo)

      reply = response.group_by { |issue| issue["milestone"] }.map do |milestone, issues|
        next if milestone.nil?

        { 
          title: milestone["title"], 
          creator: milestone["creator"],
          url: milestone["url"],
          description: milestone["description"],
          state: milestone["state"],
          number: milestone["number"],
          open_issues: milestone["open_issues"],
          closed_issues: milestone["closed_issues"],
          due_on: milestone[:due_on] || "",
          #users: issues.group_by {|x| x["user"]}.map{ |name,users|  {login: name["login"], gravatar_id: name["gravatar_id"]} },
          issues: issues 
        }
      end
      reply.sort {|a,b| a[:due_on] <=> b[:due_on]}
    end              

    def get_issues(user_name = "DovetailSoftware", repo = "blue")
      puts "retrieving issues"
      issues = self.class.get("/#{user_name}/#{repo}/issues?milestone=*&direction=asc", options)
      issues.each do |issue|
        issue["current_state"] = current_state(issue) 
      end
      issues
    end

    def current_state(issue)

      r = /(?<id>\d+) *- *(?<name>.+)/

        issue["labels"].find {|x| r.match(x["name"])}  || {"name" => "none"}

    end


    def labels(user_name = "DovetailSoftware", repo = "blue")
      response = self.class.get("/#{user_name}/#{repo}/labels", options)

      labels = []

      response.each do |label|
        r = /(?<id>\d+) *- *(?<name>.+)/
          puts label
        hash = r.match (label["name"])

        labels << { name: label["name"], index: hash[:id], text: hash[:name], color: label["color"]} unless hash.nil?
      end

      labels.sort {|a,b| a[:id] <=> b[:id]}
    end


    private

      def options
        @options ||= @oauth_token.nil? ? {} : { :headers => {"Authorization" => "token #{@oauth_token}"}}
      end
  end
end
