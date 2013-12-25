require 'sinatra/base'

class Login < HuboardApplication
    get '/logout' do
      logout!
      redirect '/'
    end

    get '/login/?' do
      @parameters = params
      erb :login, :layout => :marketing
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
