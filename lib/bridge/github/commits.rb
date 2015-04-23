class Huboard
  module Commits
    
    def commits(opts={})
      gh.commits(opts)
    end
  end
end
