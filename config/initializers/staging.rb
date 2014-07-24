module HuBoard
  module Routes
    class Repositories

      before "/:user/:repo/?*" do
        return if RESERVED_URLS.include? params[:user]

        if authenticated? :private
          repo = gh.repos params[:user], params[:repo]

          raise Sinatra::NotFound if repo.message == "Not Found"

          if repo.private
            user = gh.users params[:user]
            customer = couch.customers.findPlanById user.id
            session[:github_login] = user.login
            session[:redirect_to] = user.login == gh.user.login ? "/settings/profile" : "/settings/profile/#/#{user.login}"
            halt([401, "Access denied"]) if !customer.rows.any? #|| customer.rows.first.value.stripe.customer.delinquent
          end
        else
          repo = gh.repos params[:user], params[:repo]
          raise Sinatra::NotFound if repo.message == "Not Found"
        end
      end
    end
  end
end
