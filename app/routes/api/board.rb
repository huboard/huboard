module HuBoard
  module Routes
    module Api
      class Board < Base
        get '/api/:user/:repo/board' do
          json huboard.board(params[:user], params[:repo]).meta
        end

        get '/api/:user/:repo/link_labels' do
          json huboard.board(params[:user], params[:repo]).link_labels
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

        post '/api/:user/:repo/links' do
          board = huboard.board(params[:user], params[:repo])
          link = board.create_link params[:link]
          if link
            json(
              label: link,
              columns: huboard.board(link.user, link.repo).column_labels
            )
          else
            raise HuBoard::Error, "Unable to link #{params[:link]} to your repository"
          end
        end

        delete '/api/:user/:repo/links' do
          board = huboard.board(params[:user], params[:repo])
          link = board.destroy_link params[:link]
          json(
           status: link 
          )
        end

        put '/api/:user/:repo/columns' do 
          board = huboard.board(params[:user], params[:repo])
          board.copy_board params[:columns]
          json(
            columns: huboard.board(params[:user], params[:repo]).column_labels
          )
        end

        get '/api/:user/:repo/settings' do
          board = huboard.board(params[:user], params[:repo])
          json(
            column_labels: board.column_labels,
            repository: board.gh.to_hash
          )

        end
      end
    end
  end
end
