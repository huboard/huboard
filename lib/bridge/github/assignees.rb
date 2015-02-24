class Huboard
  module Assignees
    def assignees
      gh.assignees.all.to_a
    end
  end
end
