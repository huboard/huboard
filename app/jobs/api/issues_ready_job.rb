module Api
  class IssuesReadyJob < IssuesStatusChangedJob
    action "issue_status_changed"
    timestamp Proc.new { Time.now.utc.iso8601}
    def status
      "ready"
    end
  end
end
