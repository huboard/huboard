module HuBoard
  module Routes
    class Failure < Base
      get '/unauthenticated' do
        status 403
        erb :"401", layout: false
      end
      get '/access_denied' do
        erb :"403", layout: false
      end
    end
  end
end
