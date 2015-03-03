Rails.application.routes.draw do
  root to: 'dashboard#index', constraints: LoggedInConstraint.new 
  root to: 'marketing#index', as: 'marketing_root'

  get 'integrations' => 'marketing#integrations'
  get 'pricing' => 'marketing#pricing'
  get 'login' => 'login#index'
  get 'logout' => 'login#logout'
  get 'login/public' => 'login#public'
  get 'login/private' => 'login#private'

  get '/repositories/private/:user' => 'dashboard#private', as: 'repositories_private'

  get '/repositories/public/:user' => 'dashboard#public', as: 'repositories_public'

  get '/:user'       => 'dashboard#user', as: 'user'
  get '/:user/:repo' => 'board#index', as: 'board'

  namespace :api do
    get '/:user/:repo/board' => 'board#index', as: 'board'
    get '/:user/:repo/link_labels' => 'board#link_labels', as: 'link_labels'
    get '/:user/:repo/linked/:linked_user/:linked_repo' => 'board#linked', as: 'linked_board'
  end

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
