module HuBoard
  module StripeHelpers

    def trial_available?(customer)
      customer.rows.first.value.trial == "available" rescue return false
    end

    def subscription_active?(customer)
      status = customer.rows.first.value.stripe.customer.subscriptions.data[0].status rescue false
      return status == "active" || status == "trialing"
    end

    def account_exists?(user)
      couch.customers.findPlanById(user["id"]).rows.first
    end

    def create_new_account(user, account=nil)
      account = account ? account : user

      customer = Stripe::Customer.create(email: "trial@huboard.com")
      customer_data = {
        "id" => customer.id,
        github: {
          user: user.to_hash,
          account: account.to_hash
        },
        stripe: {
          customer: customer,
        },
        trial: "available"
      }
      couch.customers.save(customer_data)
    end
  end
end
