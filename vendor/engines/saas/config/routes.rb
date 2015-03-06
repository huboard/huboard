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
  post '/charge/:id'                      => 'charges#create'
  get '/coupon_valid/:coupon_id'         => 'coupons#valid'
  put '/redeem_coupon/:id'               => 'coupons#redeem'
  put '/profile/:name/additionalInfo'    => 'profiles#info'
  put '/profile/:name/card'              => 'cards#update'
  delete '/profile/:name/plans/:plan_id' => 'plans#destroy'
  post '/profile/:user/trial/activate'   => 'trials#create'
  get '/invoices/:invoice_id'            => 'invoices#show'
  get '/:user/trial'                     => 'trials#show'
  resource :profile, :only             => :show
end
