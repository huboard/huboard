module HuBoard
  module Routes
    module Api
      class Profiles < Base

        before '/api/profiles/?*' do
          raise Sinatra::NotFound unless authenticated? :private
        end

        get '/api/profiles/?' do
          user = gh.user.to_hash
          orgs = gh.user.memberships.orgs("active").body

          orgs.select!{|org| org["role"] == "admin"}
          orgs.map!{|org| org = org["organization"]}

          json user: user, orgs: orgs.to_a
        end

        get '/api/profiles/user/?' do
          user = gh.user
          create_new_account(user) unless account_exists?(user)

          begin
            doc = couch.customers.findPlanById(user['id'])
            customer = Stripe::Customer.retrieve(doc.rows.first.value.id)

            plan = plan_for("User", customer)
            purchased = plan["status"] == "active" || 
              plan["status"] == "trialing"

            data = {
              org: user.to_hash,
              plans: [plan],
              card: customer.default_card,
              discount: customer.discount || {discount: { coupon: {id: ''} }},
              is_owner: true,
              has_plan: purchased
            }
          rescue => e
            #Maybe Raygun?
            json data
          end
          json data
        end

        get '/api/profiles/:org/?' do
          org = gh.orgs(params[:org])

          user = org.memberships(gh.user["login"]) do |req|
            req.headers["Accept"] = "application/vnd.github.moondragon+json"
          end
          org.merge! is_owner: user["role"] == "admin"
          create_new_account(gh.user, org) unless account_exists?(org)

          begin
            doc = couch.customers.findPlanById(org['id'])
            customer = Stripe::Customer.retrieve(doc.rows.first.value.id)

            plan = plan_for("Organization", customer)
            purchased = plan["status"] == "active" || 
              plan["status"] == "trialing"

            data = {
              org: org.to_hash,
              plans: [plan],
              card: customer.default_card,
              discount: customer.discount || {discount: { coupon: {id: ''} }},
              is_owner: true,
              has_plan: purchased
            }
          rescue => e
            #Maybe Raygun?
            json data
          end
          json data
        end

        get '/api/profiles/:org/history' do
          org = gh.users(params[:org])
          customer = couch.customers.findPlanById(org['id'])
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
