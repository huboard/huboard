class Huboard
  module Assignees
    def assignees
      gh.assignees.all
    end
  end
end
