module HuBoard
  module Routes
    module Api
      class Board < Base
        get '/api/:user/:repo/board' do
          json huboard.board(params[:user], params[:repo]).meta
        end

        get '/api/:user/:repo/linked/:linked_user/:linked_repo' do
          board = huboard.board(params[:user], params[:repo])
          if board.linked? params[:linked_user], params[:linked_repo]
            json board.linked(params[:linked_user], params[:linked_repo])
          else
            json(failure: true, message: "couldn't link board")
          end
        end
      end
    end
  end
end
