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

        get '/api/:user/:repo/links' do
          board = huboard.board(params[:user], params[:repo])
          links = board.link_labels.map do |label|
            {
              label: label,
              columns: huboard.board(label.user, label.repo).column_labels
            }
          end
          json links 
        end
      end
    end
  end
end
