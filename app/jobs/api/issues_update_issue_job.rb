module Api
  class IssuesUpdateIssueJob < IssueEventJob
    include IsPublishable
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_updated"

    def payload(params)
      { issue: params[:issue] }
    end
  end
end
