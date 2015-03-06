module Saas
  class TrialsController < Saas::ApplicationController
    include ::HuBoard::AccountHelpers
    def show
        @user = params[:user]

        account_type = gh.users(@user)["type"]
        if account_type == "User"
          is_admin = gh.user["login"] == @user
        elsif account_type == "Organization"
          orgs = gh.user.memberships
          orgs_list = orgs.select{|org| org["role"] == "admin"}
          is_admin = orgs_list.any?{|org| org["organization"]["login"] == @user }
        end

        query = Queries::CouchCustomer.get(gh.users(@user)["id"], couch)
        plan_doc = QueryHandler.exec(&query)
        customer = account_exists?(plan_doc) ? plan_doc[:rows].first.value : false

        redirect_to session[:forward_to] && session[:forward_to] = "/" unless trial_available?(customer) && is_admin
    end
    def create
        user_or_org = gh.users(params[:user])
        user_or_org["email"] = params[:billing_email]
        query = Queries::CouchCustomer.get(user_or_org["id"], couch)
        plan_doc = QueryHandler.exec(&query) 
        doc = account_exists?(plan_doc) ? plan_doc[:rows].first.value : create_new_account(gh.user, user_or_org)

        if doc && doc.trial == "available"
          customer = Stripe::Customer.retrieve(doc.id)
          account_type = doc.github.account.type == "User" ? "user_basic_v1" : "org_basic_v1"
          customer.subscriptions.create({
            plan: account_type,
            trial_end: (Time.now.utc + (15 * 60 * 60 * 24)).to_i
          })

          customer.email = params[:billing_email]
          customer.save rescue puts "Failed to save #{customer}"

          doc.trial = "active"
          doc.billing_email = customer.email
          doc.stripe.customer = customer
          couch.customers.save doc
        end

        return render(json: { redirect: params[:forward_to] }) if request.xhr?
        redirect_to session[:forward_to]
    end
  end
end
