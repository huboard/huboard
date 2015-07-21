module Api
  class MilestonesController < ApplicationController
    def create
      milestone = huboard.board(params[:user],params[:repo])
        .create_milestone params

      render json: milestone
    end
    def update
      milestone = huboard.board(params[:user],params[:repo])
      .milestone(params[:id]).patch(params[:milestone])

      render json: milestone
    end

    def reorder_milestone
      user, repo, number, index = params[:user], params[:repo], params[:number], params[:index]
      @milestone =  huboard.board(user, repo).milestone number
      render json: @milestone.reorder(index)
    end
  end
end
