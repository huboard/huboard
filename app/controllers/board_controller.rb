class BoardController < ApplicationController
  def index
    UseCase::FetchBoard.new(huboard).run(params).match do
      success do
        @repo = gh.repos(params[:user],params[:repo])
        @repo.merge!(is_collaborator: is_collaborator?(@repo))
        render :index, layout: "ember"
      end

      failure :no_board do
        redirect_to "/#{params[:user]}/#{params[:repo]}/board/create"
      end

      failure :no_issues do
        redirect_to "/#{params[:user]}/#{params[:repo]}/board/enable_issues"
      end

      failure :not_found do
        not_found
      end
    end

    def create_board
      not_found unless logged_in?
      @parameters = params
      @repo = gh.repos(params[:user],params[:repo])

      board = huboard.board(params[:user], params[:repo])
      return redirect_to "/#{params[:user]}/#{params[:repo]}/" if board.has_board?

      render :create_board
    end

    def create
      begin
        huboard.board(params[:user], params[:repo]).create_board
      rescue Ghee::UnprocessableEntity
        redirect_to "/#{params[:user]}/#{params[:repo]}/"
      end
      redirect_to "/#{params[:user]}/#{params[:repo]}/"
    end
  end
end
