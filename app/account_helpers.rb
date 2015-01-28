module HuBoard
  module AccountHelpers

    def trial_available?(customer)
      customer.rows.first.value.trial == "available" rescue return false
    end

    def subscription_active?(customer)
      id = customer.rows.first.value.id
      query = Queries::StripeCustomer.subscription(id)
      sub = QueryHandler.exec(&query)

      return false unless sub
      return sub.status == "active" || sub.status == "trialing"
    end

    def account_exists?(customer)
      customer["rows"] && customer.rows.size > 0
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

    #TODO this mapper is largly superflous, the client code should 
    #more closey match a customers data
    def plan_for(user_or_org, customer)
      if customer.subscriptions["data"].size > 0
        plan = customer.subscriptions["data"][0]
        plan[:amount] = plan.amount
      else
        price = user_or_org == "User" ? 7 : 24
        plan = { status: "inactive", amount: price}
      end
      id = user_or_org == "User" ? "user_basic_v1" : "org_basic_v1"
      plan[:id] = id
      plan[:name] = user_or_org
      plan[:purchased] = plan[:status] == "active"
      plan[:card] = customer.cards.data[0] rescue false
      plan
    end
  end
end
