module HuBoard
  module Routes
    class Profiles < Base
      include AccountHelpers

      set :stripe_key, ENV['STRIPE_API']
      set :stripe_publishable_key, ENV['STRIPE_PUBLISHABLE_API']

      Stripe.api_key = settings.stripe_key

      before '/settings/?*' do
        protected!
      end

      helpers do
        def protected!
          return current_user if authenticated? :private
          authenticate! :scope => :private
        end
      end

      get "/settings/:user/trial" do
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

        redirect session[:forward_to] && session[:forward_to] = "/" unless trial_available?(customer) && is_admin
        erb :activate_trial
      end

      post '/settings/profile/:user/trial/activate' do
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

        halt json(redirect: params[:forward_to]) if request.xhr?
        redirect session[:forward_to]
      end

      get "/settings/profile/?" do
        @user = gh.user
        @orgs = gh.orgs

        erb :accounts, layout: :ember_layout
      end

      get "/settings/invoices/:invoice_id" do
        @invoice = Hashie::Mash.new(Stripe::Invoice.retrieve(id: params[:invoice_id], expand: ['customer', 'charge']).to_hash)

        @customer = couch.connection.get("Customers-#{@invoice.customer.id}").body

        erb :receipt, layout: false
      end

      put '/settings/profile/:name/additionalInfo/?' do
        user = gh.users params[:name]
        docs = couch.customers.findPlanById user['id']
        if docs.rows.any?
          plan_doc = docs.rows.first.value
          plan_doc.additional_info = params[:additional_info]

          couch.customers.save plan_doc
          json success: true, message: "Info updated"
        else
          json success: false, message: "Unable to find customer"
        end
      end

      put "/settings/profile/:name/card/?" do
        user = gh.users params[:name]

        docs = couch.customers.findPlanById user['id']

        if docs.rows.any?
          plan_doc = docs.rows.first.value
          
          query = Queries::StripeCustomer.get(plan_doc.id)
          customer = QueryHandler.exec(&query) || 
            halt(json(success: false, message: "No Stripe Customer: #{plan_doc.id}"))

          customer.card = params[:card][:id]
          updated = customer.save

          plan_doc.stripe.customer = customer
          couch.customers.save plan_doc

          json success: true, message: "Card updated", card: updated["cards"]["data"].first
        else
          json success: false, message: "Unable to find plan"
        end
      end
      

      delete "/settings/profile/:name/plans/:plan_id/?" do
        user = gh.users params[:name]

        docs = couch.customers.findPlanById user['id']

        if docs.rows.any?
          plan_doc = docs.rows.first.value

          query = Queries::StripeCustomer.get(plan_doc.id)
          customer = QueryHandler.exec(&query) || 
            halt(json(success: false, message: "No Stripe Customer: #{plan_doc.id}"))

          if customer.cards.total_count > 0
            customer.cards.retrieve(customer.default_card).delete
          end
          if customer.subscriptions.total_count > 0
            customer.cancel_subscription at_period_end: false
          end
          customer.save

          #Couch needs the newest stripe data, no simple way around this without some intense mapping
          #On Upgrade we can move this kind of things into background jobs..
          query = Queries::StripeCustomer.get(plan_doc.id)
          customer = QueryHandler.exec(&query) || 
            halt(json(success: false, message: "No Stripe Customer: #{plan_doc.id}"))

          plan_doc.stripe.customer = customer
          plan_doc.trial = "expired"
          couch.customers.save plan_doc

          json success: true, message: "Sorry to see you go"
        else
          json success: false, message: "Unable to find plan"
        end
      end

      get "/settings/coupon_valid/:coupon_id/?" do
        begin
          Stripe::Coupon.retrieve(params[:coupon_id])
        rescue => e
          status 422
          json(e.json_body)
        end
      end

      put "/settings/redeem_coupon/:id/?" do
        query = Queries::CouchCustomer.get_cust(params[:id], couch)
        doc = QueryHandler.exec(&query) || halt(json(success: false, message: "Couldn't find couch record: #{plan_doc.id}"))
        plan_doc = doc.rows.first.value

        begin
          customer = Stripe::Customer.retrieve(params[:id])
          customer.coupon = params[:coupon]
          response = customer.save

          plan_doc.stripe.customer.discount = customer.discount
          couch.customers.save plan_doc

          json(response)
        rescue Stripe::InvalidRequestError => e
          status 422
          json(e.json_body)
        end
      end

      post "/settings/charge/:id/?" do
        begin
          repo_owner = gh.users(params[:id])

          query = Queries::CouchCustomer.get(repo_owner["id"], couch)
          plan_doc = QueryHandler.exec(&query)
          plan_doc = account_exists?(plan_doc) ?
            plan_doc[:rows].first.value : create_new_account(gh.user, repo_owner)
          
          customer = Stripe::Customer.retrieve(plan_doc.id)
          if plan_doc[:trial] && plan_doc.trial != "available"
            customer.update_subscription({
              plan: params[:plan][:id],
              card: params[:card][:id]
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

          json success: true, card: customer["cards"]["data"].first, discount: customer.discount
        rescue Stripe::StripeError => e
          status 422
          json e.json_body
        end
      end
    end
  end
end
