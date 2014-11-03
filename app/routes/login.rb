module HuBoard
  module Routes
    class Login < Base
      helpers do
        def controller?(*controller)
          controller.include?(@controller) ? "nav__btn--active nav__item--current" : ""
        end
      end

      get '/', is_logged_in: false do
        redirect url('/login')
      end

      get "/login/?" do
        @controller = "login"
        erb :login, layout: false
      end

      get '/login/private/?' do
        authenticate! :scope => :private
        redirect params[:redirect_to] || '/'
      end

      get '/login/public/?' do
        authenticate!
        redirect params[:redirect_to] || '/'
      end

      get '/login/personal/?' do
        authenticate! :personal_token, :scope => :private
        redirect params[:redirect_to] || '/'
      end

      get '/logout/?' do
        logout!
        redirect '/login'
      end
    end
  end
end
