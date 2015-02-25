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

        #Thinking Ahead to API 2.0, all this logic should be encapsulated into an
        #event handler / background job
        post '/api/site/stripe/webhook' do
          return json message: "Not Authorized" unless params[:stripe_token] == ENV["STRIPE_WEBHOOK_TOKEN"]

          payload = Hashie::Mash.new(params)
          id = payload.data.object.customer

          if payload.type == "customer.subscription.updated" || payload.type == "customer.subscription.deleted"
            query = Queries::CouchCustomer.get_cust(id, couch)
            plan_doc = QueryHandler.exec(&query)
            halt(json(message: "Webhook received")) unless plan_doc && plan_doc.id == id

            plan_doc.trial = "expired" if payload.data.object.status != "trialing"

            customer = plan_doc.stripe.customer
            customer.subscriptions.data[0] = payload.data.object
            couch.customers.save plan_doc
          end

          json message: "Webhook received"
        end
      end
    end
  end
end
