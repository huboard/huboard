module Api
  class BoardController < ApplicationController
    #respond_to :json
    def index
      render json: huboard.board(params[:user], params[:repo]).meta
    end

    def commits
      render json: huboard.board(params[:user], params[:repo]).commits
    end

    def link_labels
      render json: huboard.board(params[:user], params[:repo]).link_labels
    end

    def linked
      board = huboard.board(params[:user], params[:repo])
      if board.linked? params[:linked_user], params[:linked_repo]
        render json: board.linked(params[:linked_user], params[:linked_repo])
      else
        response = {
          failure: true, message: "couldn't link board"
        }
        render  json: response
      end
    end
  end
end
