require 'ghee'
module Stint
  class Issue
    def initialize(issue)
      @issue = issue
    end

    def events
      @issue.events.all.map { |x| x }
    end

    def comments
      @issue.comments.all.map { |x| x }
    end

    def feed
      the_feed =  { :comments => comments, :events => events }
      return @issue.merge! the_feed
    end

  end
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

    def delete_hook(user_name, repo, id)
      gh.repos(user_name,repo).hooks(id).destroy
    end

    def create_label(user_name, repo, params)
      gh.repos(user_name, repo).labels.create(params)
    end

    def assignees(user_name, repo)
      Huboard.board_for(user_name, repo).assignees
    end

    def get_milestones(user_name, repo)
      gh.repos(user_name, repo).milestones.all
    end
    def milestones(user_name, repo)
      response = get_issues user_name, repo
      reply = response.group_by { |issue| issue["milestone"] }.map do |milestone, issues|
        next if milestone.nil?
        milestone.merge :users => issues.group_by {|x| x["user"]}.map{ |name,users| name },
          :issues => issues
      end

      reply.delete_if{|x| x.nil? || x.empty? }.sort_by {|m| m["due_on"] || "0"}
    end

    def milestone(user_name, repo, number)
      gh.repos(user_name, repo).milestones number
    end

    def get_issues(user_name, repo, label = nil)
      Huboard.board_for(user_name, repo).issues(label)
    end

    def issue_by_id(user_name, repo, id)
      gh.repos(user_name, repo).issues(id)
    end

    def feed_for_issue(user, repo, number)
      issue = Stint::Issue.new issue_by_id(user, repo, number)
      issue.feed
    end


    def update_milestone(user_name, repo, milestone)
      gh.repos(user_name, repo).milestones(milestone[:number]).patch(milestone)
    end


    def labels(user_name, repo)
      Huboard.board_for(user_name, repo).labels
    end

  end
end
