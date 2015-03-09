module Api
  class IssuesUnreadyJob < IssuesStatusChangedJob
    include IsPublishable
    action "issue_status_changed"
    timestamp Proc.new { Time.now.utc.iso8601}
    def status
      "unready"
    end
  end
end
