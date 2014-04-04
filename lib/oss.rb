class OSS < HuboardApplication

    set(:is_logged_in) do |enabled| 
      condition do
        enabled == logged_in?
      end
    end

    get "/", :is_logged_in => false do
      erb :home, :layout => :marketing 
    end

    get "/site/privacy/?" do
      return erb :privacy, :layout => :marketing 
    end

    get "/site/terms/?" do
      return erb :terms_of_service, :layout => :marketing 
    end

end

