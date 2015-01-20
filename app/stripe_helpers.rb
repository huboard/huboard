module HuBoard
  module StripeHelpers

    def subscription_active?(customer)
      customer.rows.first.value.stripe.customer.subscriptions.data[0].status == "active"
    end

    def account_exists?(user)
      couch.customers.findPlanById(user["id"]).rows.first
    end

    def create_new_account(user, account=nil)
      account = account ? account : user
      account_type = account["type"] == "User" ? "user_basic_v1" :
        "org_basic_v1"
      stripe_trial_account = {
        email: "trial@huboard.com",
        plan: account_type,
        #trial_end: (Time.now.utc + (14 * 60 * 60 * 24)).to_i
      }

      customer = Stripe::Customer.create(stripe_trial_account)
      customer_data = {
        "id" => customer.id,
        github: {
          user: user.to_hash,
          account: account.to_hash
        },
        stripe: {
          customer: customer,
          plan: {
            plan_id: account_type
          }
        }
      }
      couch.customers.save(customer_data)
    end
  end
end
