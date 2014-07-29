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

          data = {
            org: user.to_hash,
            plans: plans,
            card: customer.rows.any? ? customer.rows.map {|cust| cust.value.stripe.customer.cards.data.find {|card| card.id == cust.value.stripe.customer.default_card }}.first : nil,
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

          data = {
            org: org.to_hash,
            plans: plans,
            card: customer.rows.any? ? customer.rows.map {|cust| cust.value.stripe.customer.cards.data.find {|card| card.id == cust.value.stripe.customer.default_card }}.first : nil,
            is_owner: is_owner,
            has_plan: customer.rows.size > 0
          }
          json data
        end

        get '/api/profiles/:account/history' do
          json Stripe::Invoice.all(customer: params[:account])
        end
      end
    end
  end
end
