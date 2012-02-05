require 'ghee'
module Stint
  class Github

    def initialize(gh)
      @gh = gh
    end

    def gh
      @gh
    end

    def add_to_team(team_id, user)
      gh.orgs.teams(team_id).members.add(user)
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
      gh.repos(user_name,repo).hooks
    end

    def create_hook(user_name, repo, params) 
      gh.repos(user_name,repo).hooks.create params
    end

    def create_label(user_name, repo, params)
      gh.repos(user_name, repo).labels.create(params)
    end

    def milestones(user_name, repo)
      response = gh.repos(user_name,repo).issues(:milestone => "*").all.to_a
      reply = response.group_by { |issue| issue["milestone"] }.map do |milestone, issues|
        next if milestone.nil?
        milestone.merge :users => issues.group_by {|x| x["user"]}.map{ |name,users| name },
          :issues => issues
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
      {}
    end

    def labels(user_name, repo)
      gh.repos(user_name, repo).labels
    end

  end
end
