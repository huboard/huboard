require "spec_helper"
#requires that rails is running on port 3000 and RAILS_ENV=test

describe "Stripe Webhooks", :webhooks do

  let(:api_path) { "http://localhost:3000/api/site/stripe/webhook"}
  let(:stripe_token) { ENV["STRIPE_WEBHOOK_TOKEN"] }

  let(:api) { "#{api_path}?stripe_token=#{stripe_token}" }
  let(:content) { {"Content-Type" => "application/json"} }

  before(:each) do
    @doc = seed("couch_trial_account_seed.json")
  end

  after(:each) do
    up_to_date_doc = @couch.get(@doc["id"])
    @couch.delete_doc(up_to_date_doc)
  end

  describe "customer.subscription.updated" do

    let(:stripe_data){ File.read("#{@fixtures_path}stripe_subscription_update.json")}
    let(:post_data) {{body: stripe_data, headers: content} }

    context "when the customer exists" do
      it "Updates the customer data" do
        HTTParty.post(api, post_data)

        customer = @couch.get(@doc["id"])
        sub = customer["stripe"]["customer"]["subscriptions"]["data"][0]
        expect(sub["status"]).to eql "active"
      end
    end

    context "when the customer does not exist" do

      let(:stripe_data){ File.read("#{@fixtures_path}stripe_sub_no_user.json")}
      let(:post_data) {{body: stripe_data, headers: content} }

      it "Responds webhook received" do
        response = HTTParty.post(api, post_data).parsed_response

        expect(response).to eql({"message" => "Webhook received"})
      end
    end
  end

  describe "customer.subscription.deleted" do

    let(:stripe_data){ File.read("#{@fixtures_path}stripe_subscription_delete.json")}
    let(:post_data) {{body: stripe_data, headers: content} }

    context "when the customer exists" do
      it "cancels customer subscription" do
        HTTParty.post(api, post_data)

        customer = @couch.get(@doc["id"])
        sub = customer["stripe"]["customer"]["subscriptions"]["data"][0]
        expect(sub["status"]).to eql "canceled"
      end
    end

    context "when the customer does not exist" do

      let(:stripe_data){ File.read("#{@fixtures_path}stripe_sub_no_user.json")}
      let(:post_data) {{body: stripe_data, headers: content} }

      it "Responds webhook received" do
        response = HTTParty.post(api, post_data).parsed_response

        expect(response).to eql({"message" => "Webhook received"})
      end
    end
  end

  describe "customer has no trial key" do
    before(:each) do
      @no_trial_doc = seed("couch_trial_account_no_trial_key_seed.json")
    end

    after(:each) do
      up_to_date_doc = @couch.get(@no_trial_doc["id"])
      @couch.delete_doc(up_to_date_doc)
    end

    let(:stripe_data){ File.read("#{@fixtures_path}stripe_subscription_update_no_trial_key.json")}
    let(:post_data) {{body: stripe_data, headers: content} }

    it "Updates the customer data" do
      HTTParty.post(api, post_data)

      customer = @couch.get(@no_trial_doc["id"])
      sub = customer["stripe"]["customer"]["subscriptions"]["data"][0]
      expect(sub["status"]).to eql "active"
    end
  end
end
