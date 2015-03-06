Rails.application.routes.draw do 
  match ':status', to: 'errors#show', constraints: { status: /\d{3}/ }, via: :all
  match 'unauthenticated', to: 'errors#show', via: :all
  mount Saas::Engine => "/settings"
  scope "/api" do
    get '/profiles'      => "saas/profiles#index"
    get '/profiles/user' => 'saas/profiles#user'
    get '/profiles/:org' => 'saas/profiles#org'
    get '/profiles/:org/history' => 'saas/profiles#history'
  end
end
Saas::Engine.routes.draw do
  resource :profile, :only => :show
end
