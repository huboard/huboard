module Saas
  class CouponsController < Saas::ApplicationController
    def valid
      begin
        Stripe::Coupon.retrieve(params[:coupon_id])
        head :ok
      rescue => e
        render json: e.json_body, status: 422
      end
    end
    def redeem
      query = Queries::CouchCustomer.get_cust(params[:id], couch)
      doc = QueryHandler.exec(&query)
      return render json: {success: false, message: "Couldn't find couch record: #{plan_doc.id}"} unless doc
      plan_doc = doc.rows.first.value

      begin
        customer = Stripe::Customer.retrieve(params[:id])
        customer.coupon = params[:coupon]
        response = customer.save

        plan_doc.stripe.customer.discount = customer.discount
        couch.customers.save plan_doc

        render json: response 
      rescue Stripe::InvalidRequestError => e
        render json: e.json_body, status: 422
      end
    end
  end
end
