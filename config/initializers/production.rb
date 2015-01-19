require "raygun4ruby"
raygun_api_key = ENV["RAYGUN_APIKEY"]

Raygun.setup do |config|
  config.api_key = raygun_api_key
  config.silence_reporting = !raygun_api_key
end

module HuBoard
  module Routes
    class Repositories

      before "/:user/:repo/?*" do
        return if RESERVED_URLS.include? params[:user]

        if authenticated? :private
          repo = gh.repos params[:user], params[:repo]

          raise Sinatra::NotFound if repo['message'] == "Not Found"

          if repo['private']
            begin
              user = gh.users params[:user]
              customer = couch.customers.findPlanById user['id']
              session[:github_login] = user['login']
              session[:upgrade_url] = user['login'] == gh.user['login'] ? "/settings/profile" : "/settings/profile/#/#{user['login']}"
              return if customer.rows.any?
              customer = couch.customers.findPlanById current_user.id
              throw(:warden) unless customer.rows.any? #|| customer.rows.first.value.stripe.customer.delinquent
            rescue NoMethodError => e
              ::Raygun.track_exception(e, custom_data: { customer: customer })
              return true
            end
          end
        else
          repo = gh.repos params[:user], params[:repo]
          raise Sinatra::NotFound if repo['message'] == "Not Found"
        end
      end
    end
  end
end
