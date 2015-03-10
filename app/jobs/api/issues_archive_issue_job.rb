module Api
  class IssuesArchiveIssueJob < IssueEventJob
    include IsPublishable
    action "issue_archived"
    timestamp Proc.new { Time.now.utc.iso8601}

    def payload(params)
      {
        issue: params[:issue]
      }
    end

  end
end
