class Huboard
  module Backlog
    def backlog
      issues = self.issues
      milestones = self.milestones
      milestones = milestones.map do |m|
        {
          milestone: m,
          issues: issues.find_all {|i| i["milestone"] && i["milestone"]["number"] == m["number"]}
        }
      end

      milestones = milestones.sort_by { |m| m[:milestone]["_data"]["order"] || m[:milestone]["number"].to_f }

      {
        milestones: milestones,
        unassigned: {issues: issues.find_all {|i| i.milestone.nil? }, milestone: {title: "No milestone"}},
        assignees: assignees.to_a,
        other_labels: other_labels
      }
    end
  end
end
