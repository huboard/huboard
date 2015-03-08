module Api
  class IssuesUpdateIssueJob < IssueEventJob
    timestamp ->(params) { params[:issue]['updated_at'] }
    action "issue_updated"

    def payload(params)
    end
  end
end
