module Api
  class IssuesCreateCommentJob < IssueEventJob
    include IsPublishable
    timestamp ->(params) { params[:comment]['created_at'] }
    action "issue_commented"

    def payload(params)
      { issue: params[:issue], comment: params[:comment] }
    end
  end
end
