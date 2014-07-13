require 'sinatra/base'

class Marketing < HuboardApplication

  set :views, File.expand_path("./views",File.dirname(__FILE__))

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

  get '/pricing/?' do 
    erb :pricing, :layout => :marketing
  end

  get '/integrations/?' do 
    erb :integrations, :layout => :marketing
  end

end
