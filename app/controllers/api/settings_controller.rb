module Api
  class SettingsController < ApplicationController
    def index
      repo = gh.repos params[:user], params[:repo]
      not_found unless repo['permissions'] && repo['permissions']['push']

      board = huboard.board(params[:user], params[:repo])
      render json: {
        column_labels: board.column_labels,
        repository: board.gh.to_hash
      }

    end
  end
end
