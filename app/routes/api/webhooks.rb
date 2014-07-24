module HuBoard
  module Routes
    module Api
      class Webhooks < Base
        get '/api/:user/:repo/hooks' do
          json hooks: gh.repos(params[:user],params[:repo]).hooks
        end

        post '/api/site/webhook/issue' do
          return json message: "pong" if request.env["HTTP_X_GITHUB_EVENT"] == "ping"

          payload = Hashie::Mash.new JSON.parse(params[:payload])
          return json message: "Fail to parse message" if payload.issue.nil?

          repo = {
            repo: {
              owner: { login: payload.repository.owner.login },
              name: payload.repository.name
            }
          }
          payload.issue.extend(Huboard::Issues::Card).merge!(repo)

          case payload.action
          when "opened"
            IssueOpenedEvent.new.publish payload.issue, payload.sender.to_hash
          when "reopened"
            IssueReopenedEvent.new.publish payload.issue, payload.sender.to_hash
          when "closed"
            IssueClosedEvent.new.publish payload.issue, payload.sender.to_hash
          end

          json message: "Webhook received"
        end

        post '/api/site/webhook/comment' do
          return json message: "pong" if request.env["HTTP_X_GITHUB_EVENT"] == "ping"

          LogWebhookJob.new.log params
          json message: "Webhook received"
        end
      end
    end
  end
end
