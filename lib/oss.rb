class OSS < HuboardApplication

    set(:is_logged_in) do |enabled| 
      condition do
        enabled == logged_in?
      end
    end

    get "/", :is_logged_in => false do
      redirect to("/login/")
    end

    get "/site/privacy/?" do
      return erb :privacy, :layout => :marketing 
    end

    get "/site/terms/?" do
      return erb :terms_of_service, :layout => :marketing 
    end

    helpers do
      def protected! 
        return current_user if authenticated? :private
        authenticate!
      end

    end


    get "/settings/profile/?" do
      if logged_in?
        redirect to("/#{gh.user.login}")
      else
        session[:redirect_to] = "/settings/profile/"
        redirect to("/login/")
      end
    end

end

