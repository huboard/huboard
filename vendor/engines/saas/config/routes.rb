Rails.application.routes.draw do 
  match ':status', to: 'errors#show', constraints: { status: /\d{3}/ }, via: :all
  match 'unauthenticated', to: 'errors#show', via: :all
  mount Saas::Engine => "/settings"
end
Saas::Engine.routes.draw do
  resource :profile, :only => :show
end
