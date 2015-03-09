module Api
  class IssuesBlockJob < IssuesStatusChangedJob
    def status
      "block"
    end
  end
end
