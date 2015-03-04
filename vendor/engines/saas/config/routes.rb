Rails.application.routes.draw do 
  if ENV["HUBOARD_ENV"] == "production"
    mount Saas::Engine => "/settings"
  end
end
Saas::Engine.routes.draw do
  resource :profile, :only => :show
end
