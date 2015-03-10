module Api
  class IssuesDragCardJob < IssueEventJob
    include IsPublishable
    action ->(params) { params[:moved] ? "moved" : "reordered" }
    timestamp Proc.new { Time.now.utc.iso8601}

    def payload(params)
      {
        issue: params[:issue],
        column: params[:issue]['current_state'],
        previous: params[:previous_column]
      }
    end
  end
end
