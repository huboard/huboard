module Api
  class IssuesUnreadyJob < IssuesStatusChangedJob
    def status
      "unready"
    end
  end
end
