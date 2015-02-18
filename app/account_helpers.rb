module HuBoard
  module AccountHelpers

    def trial_available?(customer)
      customer[:trial] == "available"
    end 

    def trial_active?(customer)
      customer[:trial] == "active"
    end

    def subscription_active?(customer)
      return true if customer[:stripe][:plan] && 
        customer[:stripe][:plan][:plan_id] == "non_profit"

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

      email = (account['email'] && !account['email'].empty?) ?
        account['email'] : "trial@huboard.com"

      customer = Stripe::Customer.create(email: email)
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
      trial_and_sub = plan[:status] == "trialing" && customer.cards.total_count > 0
      plan[:purchased] = plan[:status] == "active" || trial_and_sub
      plan[:card] = customer.cards.data[0] rescue false
      plan
    end
  end
end
