module Saas
  class ProfilesController < Saas::ApplicationController
    include ::HuBoard::AccountHelpers
    def show
      render :show, layout: "application"
    end
    def index
      @user = gh.user.to_hash
      @orgs = gh.user.memberships

      @orgs.select!{|org| org["role"] == "admin"}
      @orgs.map!{|org| org = org["organization"]}
    end
    def user
      user = gh.user

      query = Queries::CouchCustomer.get(user["id"], couch)
      plan_doc = QueryHandler.exec(&query)
      return render json: {success: false, message: "Could Not Reach Couch"} if plan_doc == false

      customer = account_exists?(plan_doc) ? plan_doc[:rows].first.value : false
      return render json: default_user_mapping(user) unless customer

      plan = plan_for("User", customer[:stripe][:customer])
      data = {
        org: user.to_hash,
        plans: [plan],
        card: plan[:card],
        discount: customer[:stripe][:customer][:discount] || {discount: { coupon: {id: ''} }},
        account_email: customer["billing_email"],
        trial: customer[:trial],
        has_plan: plan[:purchased],
        non_profit: non_profit?(customer)
      }
      render json: data
    end
    def history
      org = gh.users(params[:org])

      query = Queries::CouchCustomer.get(org["id"], couch)
      customer = QueryHandler.exec(&query)
      return render json: {success: false, message: "Couldn't find couch record: #{org['id']}"} unless customer

      if customer.rows && customer.rows.size > 0
        customer_doc = customer.rows.first.value
        begin
          charges = Stripe::Charge.all(customer: customer_doc.stripe.customer.id)['data']
        rescue Exception => e
          return render json: {
            charges:[]
          }
          #json_error e, 400
        end
        render json: {
          charges: charges,
          additional_info: customer_doc.additional_info
        }
      else
        render json: {
          charges:[]
        }
      end
    end
    def org
      org = gh.orgs(params[:org])
      user = org.memberships(gh.user["login"]) do |req|
        req.headers["Accept"] = "application/vnd.github.moondragon+json"
      end
      org.merge! is_owner: user["role"] == "admin"

      query = Queries::CouchCustomer.get(org["id"], couch)
      plan_doc = QueryHandler.exec(&query)
      return render json: {success: false, message: "Could Not Reach Couch"} if plan_doc == false

      customer = account_exists?(plan_doc) ? plan_doc[:rows].first.value : false
      return render json: default_org_mapping(org) unless customer

      plan = plan_for("Organization", customer[:stripe][:customer])
      data = {
        org: org.to_hash,
        plans: [plan],
        card: plan[:card],
        discount: customer[:stripe][:customer][:discount] || {discount: { coupon: {id: ''} }},
        account_email: customer["billing_email"],
        trial: customer[:trial],
        has_plan: plan[:purchased],
        non_profit: non_profit?(customer)
      }
      render json: data
    end
    def info
      user = gh.users params[:name]
      docs = couch.customers.findPlanById user['id']
      if docs.rows.any?
        plan_doc = docs.rows.first.value
        plan_doc.additional_info = params[:additional_info]

        couch.customers.save plan_doc
        render json: {success: true, message: "Info updated"}
      else
        render json: {success: false, message: "Unable to find customer"}
      end
    end

  end
end
