module HuBoard
  module AccountHelpers

    def trial_available?(customer)
      customer[:trial] == "available"
    end 

    def trial_active?(customer)
      customer[:trial] == "available"
    end

    def subscription_active?(customer)
      cus = customer[:stripe][:customer]
      if cus[:subscriptions][:total_count] > 0
        sub = cus[:subscriptions][:data][0]
        return sub[:status] == "active" || sub[:status] == "trialing"
      end
      false
    end

    def account_exists?(customer_doc)
      customer_doc[:rows] && customer_doc[:rows].size > 0
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
      return customer_data
    end

    def plan_for(user_or_org, customer)
      if customer["subscriptions"] && customer.subscriptions["data"].size > 0
        plan = customer.subscriptions["data"][0]
      else
        plan = { status: "inactive"}
      end
      plan[:amount] = user_or_org == "User" ? 700 : 2400
      plan[:id] = user_or_org == "User" ? "user_basic_v1" : "org_basic_v1"
      plan[:name] = user_or_org
      plan[:purchased] = plan[:status] == "active" || plan[:status] == "trialing"
      plan[:card] = customer.cards.data[0] rescue false
      plan
    end
  end
end
