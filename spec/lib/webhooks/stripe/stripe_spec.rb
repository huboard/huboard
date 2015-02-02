require "spec_helper"
#requires that the webapp is running on port 5000

describe "Stripe Webhooks", :webhooks do

  let(:api_path) { "http://localhost:5000/api/site/stripe/webhook"}
  let(:stripe_token) { ENV["STRIPE_WEBHOOK_TOKEN"] }

  let(:api) { "#{api_path}?token=#{stripe_token}" }
  let(:content) { {"Content-Type" => "application/json"} }

  before(:each) do
    @doc = seed("couch_trial_account_seed.json")
  end

  after(:each) do
    up_to_date_doc = @couch.get(@doc["id"])
    @couch.delete_doc(up_to_date_doc)
  end

  describe "customer.subscription.updated" do

    let(:stripe_data){ File.read(@fixtures_path + "stripe_subscription_update.json") }
    let(:post_data) {{body: stripe_data, headers: content} }

    it "Updates the customer data" do
      HTTParty.post(api, post_data)

      customer = @couch.get(@doc["id"])
      sub = customer["stripe"]["customer"]["subscriptions"]["data"][0]
      expect(sub["status"]).to eql "active"
    end
  end
end
