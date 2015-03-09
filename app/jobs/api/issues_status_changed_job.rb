module Api
  class IssuesStatusChangedJob < IssueEventJob
    include IsPublishable
    action "issue_status_changed"
    timestamp Proc.new { Time.now.utc.iso8601}

    def payload(params)
      {
        issue: params[:issue],
        action: status
      }
    end

  end
end
