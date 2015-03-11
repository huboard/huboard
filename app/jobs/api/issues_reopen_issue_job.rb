module Api
  class IssuesReopenIssueJob < IssueEventJob
    include IsPublishable
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_reopened"

    def payload(params)
      { issue: params[:issue] }
    end
  end
end
