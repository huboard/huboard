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

    def validate
      repo = params[:link].split("/")
      board = huboard.board(repo[0], repo[1])

      unless board.repo_exists?
        return render json: {
          message: "Could not find repo: #{params[:link]}"
        }, status: 400
      end
      unless board.issues_enabled?
        return render json: {
          message: "Please enable GitHub issues for #{params[:link]}!"
        }, status: 403
      end

      render json: { link: params[:link] }, status: 200
    end
  end
end
