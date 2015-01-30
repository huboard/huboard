require "spec_helper"
#requires that the webapp is running on port 5000

describe "Stripe Webhooks", :webhooks do

  let(:api_path) { "http://localhost:5000/api/site/stripe/webhook"}
  let(:stripe_token) { ENV["STRIPE_WEBHOOK_TOKEN"] }
  let(:api) { "#{api_path}?token=#{stripe_token}"}


  before(:each) do
    @doc = seed("couch_trial_account_seed.json")
  end

  after(:each) do
    up_to_date_doc = @couch.get(@doc["id"])
    @couch.delete_doc(up_to_date_doc)
  end

  describe "customer.subscription.updated" do

    it "passes" do
      stripe_data = File.read(@fixtures_path + "stripe_subscription_update.json")
      response = HTTParty.post(api, {body: {stripe: stripe_data}})
      puts response
    end
  end
end
