require 'sinatra/base'

class Login < HuboardApplication

    unless oss?
      set :views, File.expand_path("../marketing/views",File.dirname(__FILE__))
    end

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
