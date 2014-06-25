class Huboard
  class App

    PUBLIC_URLS = ['/', '/logout','/webhook', '/site/privacy','/site/terms']
    RESERVED_URLS = %w{ assets repositories images about site login logout favicon.ico robots.txt }

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
          if ENV['RACK_ENV'] == "production"
            halt([401, "Access denied"]) if !customer.rows.any? #|| customer.rows.first.value.stripe.customer.delinquent
          end
        end

      else
        repo = gh.repos params[:user], params[:repo]
        raise Sinatra::NotFound if repo.message == "Not Found"
      end
    end
  end
  class API 

    PUBLIC_URLS = ['/authorized']
    RESERVED_URLS = %w{ subscribe settings profiles v2 site }

    before "/:user/:repo/?*" do 
      
      return if RESERVED_URLS.include? params[:user]

      if authenticated? :private
        repo = gh.repos(params[:user], params[:repo]).raw
      else
        repo = gh.repos(params[:user], params[:repo]).raw
      end

      raise Sinatra::NotFound if repo.status == 404

    end
  end
end
