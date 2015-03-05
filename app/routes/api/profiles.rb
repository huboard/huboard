module HuBoard
  module Routes
    module Api
      class Profiles < Base
        include AccountHelpers

        before '/api/profiles/?*' do
          raise Sinatra::NotFound unless authenticated? :private
        end

        get '/api/profiles/?' do
          user = gh.user.to_hash
          orgs = gh.user.memberships

          orgs.select!{|org| org["role"] == "admin"}
          orgs.map!{|org| org = org["organization"]}

          json user: user, orgs: orgs.to_a
        end

        get '/api/profiles/user/?' do
          user = gh.user

          query = Queries::CouchCustomer.get(user["id"], couch)
          plan_doc = QueryHandler.exec(&query)
          halt json({success: false, message: "Could Not Reach Couch"}) if plan_doc == false

          customer = account_exists?(plan_doc) ? plan_doc[:rows].first.value : false
          halt json(default_user_mapping(user)) unless customer

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

          json data
        end

        get '/api/profiles/:org/?' do
          org = gh.orgs(params[:org])
          user = org.memberships(gh.user["login"]) do |req|
            req.headers["Accept"] = "application/vnd.github.moondragon+json"
          end
          org.merge! is_owner: user["role"] == "admin"

          query = Queries::CouchCustomer.get(org["id"], couch)
          plan_doc = QueryHandler.exec(&query)
          halt json({success: false, message: "Could Not Reach Couch"}) if plan_doc == false

          customer = account_exists?(plan_doc) ? plan_doc[:rows].first.value : false
          halt json(default_org_mapping(org)) unless customer
          
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

          json data
        end

        get '/api/profiles/:org/history' do
          org = gh.users(params[:org])

          query = Queries::CouchCustomer.get(org["id"], couch)
          customer = QueryHandler.exec(&query) || halt(json(success: false, message: "Couldn't find couch record: #{org['id']}"))

          if customer.rows && customer.rows.size > 0
            customer_doc = customer.rows.first.value
            begin
              charges = Stripe::Charge.all(customer: customer_doc.stripe.customer.id)['data']
            rescue Exception => e
              json({
                charges:[]
              })
              #json_error e, 400
            end
            json({
              charges: charges,
              additional_info: customer_doc.additional_info
            })
          else
            json({
              charges:[]
            })
          end
        end
      end
    end
  end
end
