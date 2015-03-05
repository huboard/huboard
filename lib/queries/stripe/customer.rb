module Queries
  class StripeCustomer

    def self.get(id)
      -> { Stripe::Customer.retrieve(id) }
    end

    def self.subscription(id)
      customer = self.get(id)
      -> { customer.call.subscriptions.all.data[0] }
    end
  end
end

