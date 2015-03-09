module Api
  class ColumnsController < ApplicationController
    def update
      board = huboard.board(params[:user], params[:repo])
      board.copy_board params[:columns]
      render json: {
        columns: huboard.board(params[:user], params[:repo]).column_labels
      }
    end
  end
end
