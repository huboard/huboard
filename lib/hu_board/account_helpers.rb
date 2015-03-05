module HuBoard
  module AccountHelpers
    extend self

    def trial_available?(customer)
      customer == false || customer[:trial] == "available"
    end 

    def trial_active?(customer)
      customer && customer[:trial] == "active"
    end

    def non_profit?(customer)
      customer[:stripe][:plan] && 
        customer[:stripe][:plan][:plan_id] == "non_profit"
    end

    def subscription_active?(customer)
      return true if non_profit?(customer)
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
      return Hashie::Mash.new(customer_data)
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

    def default_org_mapping(org)
      {
        org: org.to_hash,
        plans: [{
          name: 'Organization',
          id: 'org_basic_v1',
          status: 'inactive',
          amount: 2400
        }],
        trial: 'available',
        has_plan: false,
        non_profit: false
      }
    end

    def default_user_mapping(user)
      {
        org: user.to_hash,
        plans: [{
          name: 'User',
          id: 'user_basic_v1',
          status: 'inactive',
          amount: 700 
        }],
        trial: 'available',
        has_plan: false,
        non_profit: false
      }
    end
  end
end
