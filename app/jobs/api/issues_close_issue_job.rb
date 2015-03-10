module Api
  class IssuesCloseIssueJob < IssueEventJob
    include IsPublishable
    timestamp ->(params) { params[:issue]['closed_at'] }
    action "issue_closed"

    def payload(params)
      { issue: params[:issue] }
    end
  end
end
