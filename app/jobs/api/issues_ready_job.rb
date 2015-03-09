module Api
  class IssuesReadyJob < IssuesStatusChangedJob
    def status
      "ready"
    end
  end
end
