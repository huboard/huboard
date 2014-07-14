require 'sinatra/base'

class Login < HuboardApplication

    def controller?(*controller)
      controller.include?(@controller) ? "nav__btn--active nav__item--current" : ""
    end

    get '/logout' do
      logout!
      redirect '/'
    end

    get '/login/?' do
      @parameters = params
      @controller = "login"
      erb :login, :layout => false
    end

    get '/login/private/?' do
      authenticate! :scope => :private
      redirect params[:redirect_to] || '/'
    end

    get '/login/public/?' do
      authenticate!
      redirect params[:redirect_to] || '/'
    end
end
