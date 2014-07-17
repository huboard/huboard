module HuBoard
  module Routes
    module Api
      class Board < Base
        get '/api/:user/:repo/board' do 
          return json huboard.board(params[:user],params[:repo]).meta
        end
      end
    end
  end
end
