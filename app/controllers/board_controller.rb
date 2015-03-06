class BoardController < ApplicationController
  def index
    UseCase::FetchBoard.new(huboard).run(params).match do
      success do
        @repo = gh.repos(params[:user],params[:repo])
        @repo.merge!(is_collaborator: is_collaborator?(@repo))
        render :index, layout: "ember"
      end
    end
  end
end
