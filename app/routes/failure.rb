module HuBoard
  
  module Routes
    class Failure < Base

      get '/unauthenticated' do
        status 403
        erb :"401", layout: false
      end

      get '/bad_credentials' do
        options = env['warden.options']
        session[:redirect_to] = options[:attempted_path]
        logout!
        erb :"403", layout: false
      end
    end
  end
end
