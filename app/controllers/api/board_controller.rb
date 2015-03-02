module Api
  class BoardController < ApplicationController
    #respond_to :json
    def index
      render json: huboard.board(params[:user], params[:repo]).meta
    end

    def link_labels
      render json: huboard.board(params[:user], params[:repo]).link_labels
    end
  end
end
