require 'sinatra/base'

class Marketing < HuboardApplication

  set :views, File.expand_path("./views",File.dirname(__FILE__))

  set(:is_logged_in) do |enabled| 
    condition do
      enabled == logged_in?
    end
  end

  helpers do
    def cloudfront_path(image)
      URI::join(ENV["CLOUDFRONT_URL"],image)
    end

    def controller?(*controller)
      controller.include?(@controller) ? "nav__item--current" : ""
    end
  end

  get "/", :is_logged_in => false do
    @controller = params[:controller] || "home"
    erb :home, :layout => :marketing 
  end

  get "/site/privacy/?" do
    @controller = "privacy"
    return erb :privacy, :layout => :marketing 
  end

  get "/site/terms/?" do
    @controller = "terms"
    return erb :terms_of_service, :layout => :marketing 
  end

  get '/pricing/?' do 
    @controller = "pricing"
    erb :pricing, :layout => :marketing
  end

  get '/integrations/?' do 
    @controller = "integrations"
    erb :integrations, :layout => :marketing
  end

end
