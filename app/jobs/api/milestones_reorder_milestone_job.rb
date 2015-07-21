module Api
  class MilestonesReorderMilestoneJob < MilestoneEventJob
    include IsPublishable
    action "milestone_reordered" 
    timestamp Proc.new { Time.now.utc.iso8601 }

    def payload(params)
      {
        milestone: params[:milestone]
      }
    end
  end
end
