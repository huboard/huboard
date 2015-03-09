module Api
  class LinksController < ApplicationController
    def index
      repo = gh.repos params[:user], params[:repo]
      not_found unless repo['permissions'] && repo['permissions']['push']

      board = huboard.board(params[:user], params[:repo])
      links = board.link_labels.map do |label|
        {
          label: label,
          columns: huboard.board(label['user'], label['repo']).column_labels
        }
      end
      render json: links 
    end
    def create
      board = huboard.board(params[:user], params[:repo])
      link = board.create_link params[:link]
      if link
       render json: {
          label: link,
          columns: huboard.board(link['user'], link['repo']).column_labels
        }
      else
        raise HuBoard::Error, "Unable to link #{params[:link]} to your repository"
      end
    end
    def destroy
      board = huboard.board(params[:user], params[:repo])
      link = board.destroy_link params[:link]
      render json: {
        status: link 
      }
    end
  end
end
