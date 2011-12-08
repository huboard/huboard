require 'httparty'

module Stint

  class Github
    include HTTParty
    format :json
    base_uri "https://api.github.com"

    def initialize(oauth_hash=nil)
      @oauth_hash = oauth_hash 
    end

    def add_to_team(team_id, user)
      post_data = {body:{login:user.login}.to_json, header:{"Content-Type"=> "application/json"}}.merge(options)
      self.class.put("/teams/#{team_id}/members/#{user.login}",post_data)
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

    def hooks(user_name, repo)
        self.class.get("/repos/#{user_name}/#{repo}/hooks", options)
    
    end

    def create_hook(user_name, repo, params) 
      post_data = {body:params.to_json, header: {"Content-Type"=> "application/json"}}
      post_data.merge!(options)
      self.class.post("/repos/#{user_name}/#{repo}/hooks", post_data)
    end

    def milestones(user_name, repo)
      response = self.class.get("/repos/#{user_name}/#{repo}/issues?milestone=*&direction=asc&per_page=100", options)
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
          due_on: milestone["due_on"] || "",
          users: issues.group_by {|x| x["user"]}.map{ |name,users| name },
          issues: issues 
        }
      end
      reply.sort_by {|m| m[:due_on]}
    end

    def get_issues(user_name, repo)
      self.class.get("/repos/#{user_name}/#{repo}/issues?direction=asc&per_page=100", options)
    end

    def issue_by_id(user_name, repo, id)
      self.class.get("/repos/#{user_name}/#{repo}/issues/#{id}", options)
    end

    def update_issue(user_name, repo, issue)
      post_data = {body:issue.to_json, header:{"Content-Type"=> "application/json"}}
      post_data.merge!(options)
      self.class.post("/repos/#{user_name}/#{repo}/issues/#{issue["number"]}",post_data)
    end
    def update_milestone(user_name, repo, milestone)
       post_data = {body: milestone.to_json, header:{"Content-Type"=> "application/json"}}
      post_data.merge!(options)
      self.class.post("/repos/#{user_name}/#{repo}/milestones/#{milestone[:number]}",post_data)
    end

    def close_issue(user_name, repo, issue)
      post_data = {body:{state:"closed"}.to_json, header:{"Content-Type"=> "application/json"}}
      post_data.merge!(options)
      self.class.post("/repos/#{user_name}/#{repo}/issues/#{issue["number"]}",post_data)

    end

    def labels(user_name, repo)
      self.class.get("/repos/#{user_name}/#{repo}/labels", options)
    end

    private
      def options
        @options ||= @oauth_hash || {}  
      end
  end

end
