require 'httparty'
require 'ghee'

module Stint

  class Github
    include HTTParty
    format :json
    base_uri "https://api.github.com"

    def initialize(oauth_hash=nil, gh)
      @oauth_hash = oauth_hash 
      @gh = gh
    end

    def gh
      @gh
    end

    def add_to_team(team_id, user)
      post_data = {body:{login:user.login}.to_json, header:{"Content-Type"=> "application/json"}}.merge(options)
      self.class.put("/teams/#{team_id}/members/#{user.login}",post_data)
    end

    def repos(org = nil)
     return gh.orgs(org).repos unless org.nil?

      gh.user.repos.all
    end

    def orgs
      gh.user.orgs
    end

    def user 
      gh.user
    end

    # just need to add hook support to ghee
    def hooks(user_name, repo)
        self.class.get("/repos/#{user_name}/#{repo}/hooks", options)
    end

    def create_hook(user_name, repo, params) 
      post_data = {body:params.to_json, header: {"Content-Type"=> "application/json"}}
      post_data.merge!(options)
      self.class.post("/repos/#{user_name}/#{repo}/hooks", post_data)
    end

    def create_label(user_name, repo, params)
      gh.repos(user_name, repo).labels.create(params)
    end

    def milestones(user_name, repo)
      response = gh.repos(user_name,repo).issues(:milestone => "*").all.to_a
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
      
      reply.delete_if{|x| x.nil? }.sort_by {|m| m[:due_on]}
    end

    def get_issues(user_name, repo)
      gh.repos(user_name, repo).issues(:direction => "asc").all
    end

    def issue_by_id(user_name, repo, id)
      gh.repos(user_name, repo).issues(id)
    end

    def update_issue(user_name, repo, issue)
      gh.repos(user_name, repo).issues(issue["number"]).patch(issue)
    end
    
    def update_milestone(user_name, repo, milestone)
      gh.repos(user_name, repo).milestones(milestone[:number]).patch(milestone)
    end

    def close_issue(user_name, repo, issue)
      gh.repos(user_name, repo).issues(issue["number"]).close
    end

    def labels(user_name, repo)
      gh.repos(user_name, repo).labels
    end

    private
      def options
        @options ||= @oauth_hash || {}  
      end
  end

end
