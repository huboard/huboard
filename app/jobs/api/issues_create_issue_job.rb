module Api
  class IssuesCreateIssueJob < IssueEventJob
    include IsPublishable
    action "issue_opened"
    timestamp ->(params) { params[:issue]['created_at']}

    def payload(params)
      {
        issue: params[:issue]
      }
    end

  end
end
