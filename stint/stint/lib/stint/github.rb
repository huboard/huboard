require 'httparty'

module Stint

  class Github
    include HTTParty
    format :json
    base_uri "https://api.github.com"

    def initialize(oauth_token=nil)
      @oauth_token = oauth_token
    end

    def repos(org = nil)
     return self.class.get("/orgs/#{org}/repos", options) unless org.nil?

      self.class.get("/user/repos", options)
    end


    def orgs
      self.class.get("/user/orgs",options)
    end

    def user 
      self.class.get("/user",options)
    end


    def milestones(user_name, repo)
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

    def get_issues(user_name, repo)
      puts "retrieving issues"
      issues = self.class.get("/repos/#{user_name}/#{repo}/issues?milestone=*&direction=asc", options)
      issues.each do |issue|
        issue["current_state"] = current_state(issue)
      end
      issues
    end

    def current_state(issue)
      r = /(?<id>\d+) *- *(?<name>.+)/
      issue["labels"].find {|x| r.match(x["name"])}  || {"name" => "none"}
    end


    def labels(user_name, repo)
      response = self.class.get("/repos/#{user_name}/#{repo}/labels", options)
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
