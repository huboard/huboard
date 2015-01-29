module HuBoard
  module Routes
    class Profiles < Base
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

        docs = couch.customers.findPlanById gh.users(@user)["id"]
        trial = docs.rows.first.value.trial

        redirect session[:forward_to] if trial != "available"
        erb :activate_trial
      end

      post '/settings/profile/:user/trial/activate' do
        docs = couch.customers.findPlanById gh.users(params[:user])["id"]
        doc = docs.rows.first.value

        if doc.trial == "available"
          customer = Stripe::Customer.retrieve(doc.id)
          account_type = doc.github.account.type == "User" ? "user_basic_v1" : "org_basic_v1"
          customer.subscriptions.create({
            plan: account_type,
            trial_end: (Time.now.utc + (15 * 60 * 60 * 24)).to_i
          })

          customer.save rescue puts "Failed to save #{customer}"

          doc.trial = "active"
          doc.billing_email = params[:billing_email]
          doc.stripe.customer = customer
          couch.customers.save doc
        end

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

          customer = Stripe::Customer.retrieve(plan_doc.stripe.customer.id)

          customer.card = params[:card][:id]
          updated = customer.save

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
          customer = QueryHandler.exec(&query) || erb(:"500")

          if customer.cards.total_count > 0
            customer.cards.retrieve(customer.default_card).delete
          end
          customer.cancel_subscription at_period_end: false
          customer.save

          plan_doc.stripe.customer = customer
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
        begin
          customer = Stripe::Customer.retrieve(params[:id])
          customer.coupon = params[:coupon]
          response = customer.save

          json(response)
        rescue Stripe::InvalidRequestError => e
          status 422
          json(e.json_body)
        end
      end

      post "/settings/charge/:id/?" do
        begin
          repo_user = gh.users(params[:id])

          docs = couch.customers.findPlanById repo_user["id"]
          plan_doc = docs.rows.first.value
          
          query = Queries::StripeCustomer.get(plan_doc.id)
          customer = QueryHandler.exec(&query) || erb(:"500")

          
          if plan_doc[:trial] && plan_doc.trial == "active"
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
