module HuBoard
  module Routes
    class Fallback < Base
      get '/settings/profile/?*' do
        redirect url("/" + current_user.login)
      end
    end
  end
end
