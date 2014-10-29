module HuBoard
  module Routes
    module Api
      class Profiles < Base

        before '/api/profiles/?*' do
          raise Sinatra::NotFound unless authenticated? :private
        end

        get '/api/profiles/?' do
          user = gh.user.to_hash
          orgs = gh.orgs.to_a

          json user: user, orgs: orgs
        end

        get '/api/profiles/user/?' do
          user = gh.user
          user.merge! billing_email: user.email

          customer = couch.customers.findPlanById(user.id)
          plans_doc = couch.connection.get("./plans").body

          plans = plans_doc.stripe[plans_doc.meta.mode]["User"]

          plans = plans.map do |plan|
            plan.merge! purchased: customer.rows.any? { |row| row.value.stripe.plan.plan_id == plan.plan_id }
          end

          card = nil

          if customer.rows.any?
            customer_doc = customer.rows.first.value
            card = customer_doc.stripe.customer.cards.nil? ? nil : customer_doc.stripe.customer.cards.data.find {|card| card.id == customer_doc.stripe.customer.default_card }
             discount = customer_doc.stripe.customer.discount
          end

          data = {
            org: user.to_hash,
            plans: plans,
            card: card,
            discount: discount || {discount: { coupon: {id: ''} }},
            is_owner: true,
            has_plan: customer.rows.size > 0
          }
          json data
        end

        get '/api/profiles/:org/?' do
          org = gh.orgs(params[:org])
          is_owner = gh.orgs(params[:org]).teams.any? { |t| t.name == "Owners" }
          org.merge! is_owner: is_owner

          customer = couch.customers.findPlanById(org.id)
          plans_doc = couch.connection.get("./plans").body

          plans = plans_doc.stripe[plans_doc.meta.mode]["Organization"]

          plans = plans.map do |plan|
            plan.merge! purchased: customer.rows.any? { |row| row.value.stripe.plan.plan_id == plan.plan_id}
          end

          card = nil

          if customer.rows.any?
            customer_doc = customer.rows.first.value
            card = customer_doc.stripe.customer.cards.nil? ? nil : customer_doc.stripe.customer.cards.data.find {|card| card.id == customer_doc.stripe.customer.default_card }
             discount = customer_doc.stripe.customer.discount
          end
          
          data = {

            org: org.to_hash,
            plans: plans,
            card: card,
            discount: discount || {discount: { coupon: {id: ''} }},
            is_owner: is_owner,
            has_plan: customer.rows.size > 0
          }
          json data
        end

        get '/api/profiles/:org/history' do
          org = gh.users(params[:org])
          customer = couch.customers.findPlanById(org.id)
          if customer.rows && customer.rows.size > 0
            customer_doc = customer.rows.first.value
            charges = Stripe::Charge.all(customer: customer_doc.stripe.customer.id)['data']
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
