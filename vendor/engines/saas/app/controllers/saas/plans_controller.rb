module Saas
  class PlansController < Saas::ApplicationController
    def destroy
      user = gh.users params[:name]

      docs = couch.customers.findPlanById user['id']

      if docs.rows.any?
        plan_doc = docs.rows.first.value

        query = Queries::StripeCustomer.get(plan_doc.id)
        customer = QueryHandler.exec(&query)
        return render json: {success: false, message: "No Stripe Customer: #{plan_doc.id}"} unless customer

        if customer.cards.total_count > 0
          customer.cards.retrieve(customer.default_card).delete
        end
        if customer.subscriptions.total_count > 0
          customer.subscriptions.each do |sub|
            sub.delete at_period_end: false
          end
        end
        customer.save

        #Couch needs the newest stripe data, no simple way around this without some intense mapping
        #On Upgrade we can move this kind of things into background jobs..
        query = Queries::StripeCustomer.get(plan_doc.id)
        customer = QueryHandler.exec(&query)
        return render json: {success: false, message: "No Stripe Customer: #{plan_doc.id}"} unless customer

        plan_doc.stripe.customer = customer
        plan_doc.trial = "expired"
        couch.customers.save plan_doc

        render json: {success: true, message: "Sorry to see you go"}
      else
        render json: {success: false, message: "Unable to find plan"}
      end
    end
  end
end
