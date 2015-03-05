Rails.application.routes.draw do 
  mount Saas::Engine => "/settings"
end
Saas::Engine.routes.draw do
  resource :profile, :only => :show
end
