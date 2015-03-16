module Saas
  class CardsController < Saas::ApplicationController
    def update
      user = gh.users params[:name]

      docs = couch.customers.findPlanById user['id']

      if docs.rows.any?
        plan_doc = docs.rows.first.value

        query = Queries::StripeCustomer.get(plan_doc.id)
        customer = QueryHandler.exec(&query) 
        return render json: {success: false, message: "No Stripe Customer: #{plan_doc.id}"} unless customer

        customer.card = params[:card][:id]
        updated = customer.save

        invoices = Stripe::Invoice.all(customer: customer.id)
        if invoices.first
          invoices.first.pay unless invoices.first.closed
        end

        plan_doc.stripe.customer = customer
        couch.customers.save plan_doc

        render json: {success: true, message: "Card updated", card: updated["cards"]["data"].first}
      else
        render json: {success: false, message: "Unable to find plan"}
      end


    end
  end
end
