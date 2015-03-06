module Saas
  class ChargesController < Saas::ApplicationController
    def create
      begin
        repo_user = gh.users(params[:id])

        docs = couch.customers.findPlanById repo_user["id"]
        plan_doc = docs.rows.first.value

        customer = Stripe::Customer.retrieve(plan_doc.id)
        if plan_doc[:trial] && plan_doc.trial != "available"
          customer.update_subscription({
            plan: params[:plan][:id],
            card: params[:card][:id],
            trial_end: 'now'
          })
        else
          customer.subscriptions.create({
            plan: params[:plan][:id],
            card: params[:card][:id]
          })
        end

        if !params[:coupon].nil? && !params[:coupon].empty?
          customer.coupon = params[:coupon]
        end

        customer.email = params[:email]
        customer.save

        plan_doc.stripe.customer = customer
        plan_doc.billing_email = params[:email]
        plan_doc.trial = "expired"
        couch.customers.save plan_doc

        render json: { success: true, card: customer["cards"]["data"].first, discount: customer.discount}
      rescue Stripe::StripeError => e
        render json: e.json_body, status: 422
      end
    end
  end
end
