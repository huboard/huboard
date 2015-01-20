module HuBoard
  module Routes
    class Repositories

      before "/:user/:repo/?*" do 

        return if RESERVED_URLS.include? params[:user]

        if authenticated? :private
          repo = gh.repos params[:user], params[:repo]

          raise Sinatra::NotFound if repo['message'] == "Not Found"

          if repo['private'] 
            user = gh.users params[:user]
            create_new_account(gh.user, user) unless account_exists?(user) || repo['owner']['login'] != gh.user['login']
            customer = couch.customers.findPlanById user['id']
            session[:github_login] = user['login']
            session[:upgrade_url] = user['login'] == gh.user['login'] ? "/settings/profile" : "/settings/profile/#/#{user['login']}"
            return if customer.rows.any? && subscription_active?(customer)
            customer = couch.customers.findPlanById current_user.id
            throw(:warden) if !customer.rows.any? || !subscription_active?(customer)
          end

        else
          repo = gh.repos params[:user], params[:repo]
          raise Sinatra::NotFound if repo['message'] == "Not Found"
        end
      end

    end
  end
end


