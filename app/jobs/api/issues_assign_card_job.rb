module Api
  class IssuesAssignCardJob < IssueEventJob
    include IsPublishable
    action 'assigned'
    timestamp Proc.new { Time.now.utc.iso8601}
    def payload(params)
      {
        issue: params[:issue],
        assignee: params[:issue]["assignee"]
      }
    end
  end
end

