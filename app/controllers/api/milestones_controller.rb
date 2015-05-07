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
  end
end
