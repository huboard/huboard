module HuBoard
  module StripeHelpers

    def trial_available?(customer)
      customer.rows.first.value.trial == "available" rescue return false
    end

    def subscription_active?(customer)
      begin
        id = customer.rows.first.value.id
        sub = Stripe::Customer.retrieve(id).subscriptions.all
        status = sub.data[0].status 
      rescue => e
        return false
      end
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

    def plan_for(user_or_org, customer)
      if customer.subscriptions.all.data.size > 0
        plan = customer.subscriptions.all.data[0].to_hash
      else
        plan = { status: "pending", plan: {amount: 0}}
      end
      id = user_or_org == "User" ? "user_basic_v1" : "org_basic_v1"
      plan["id"] = id
      plan["amount"] = plan[:plan][:amount].to_i
      plan["name"] = user_or_org
      plan["purchased"] = plan[:status] == "active"
      plan
    end
  end
end
