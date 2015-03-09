module Api
  class IssuesUnblockJob < IssuesStatusChangedJob
    def status
      "unblock"
    end
  end
end
