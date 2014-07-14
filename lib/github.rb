require 'ghee'
module Stint
  class Github

    def initialize(gh)
      @gh = gh
    end

    def gh
      @gh
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


    def milestone(user_name, repo, number)
      gh.repos(user_name, repo).milestones number
    end

    def milestones(user_name, repo)
      gh.repos(user_name, repo).milestones
    end

    def update_milestone(user_name, repo, milestone)
      gh.repos(user_name, repo).milestones(milestone[:number]).patch(milestone)
    end

  end
end
