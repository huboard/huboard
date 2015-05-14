class Huboard
  module Commits
    
    def commits(opts={})
      gh.commits(opts)
    end

    def commit(commit)
      gh.commits(commit)
    end
  end
end
