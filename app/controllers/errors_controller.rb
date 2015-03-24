class ErrorsController < ApplicationController
  layout false
  def unauthenticated
    respond_to do |format|
      format.html {render :unauthenticated, status: 403}
      format.json { render json: { error: "Unauthenticated" }, status: 403}
    end
  end
  def not_found
    respond_to do |format|
      format.html {render [:not_found, :not_found_b].sample, status: 404}
      format.json { render json: { error: "Not found" }, status: 404}
    end
  end
  def unprocessable_entity
    @exception = env["action_dispatch.exception"]
    respond_to do |format|
      format.html { render :server_error, status: 422 }
      format.json { render json: { status: 422, error: @exception.message, message: @exception.message}, status: 422  }
    end
  end
  def server_error
    @exception = env["action_dispatch.exception"]
    respond_to do |format|
      format.html {render :server_error, status: 500 }
      format.json { render json: { status: 500, error: @exception.message, message: @exception.message}, status: 500  }
    end
  end

  helper_method :is_owner
  helper_method :issues_enabled
  :protected
    def is_owner
      account_type = gh.users(params[:user])["type"]
      if account_type == "User"
        is_admin = gh.user["login"] == params[:user]
      elsif account_type == "Organization"
        orgs = gh.user.memberships
        orgs_list = orgs.select{|org| org["role"] == "admin"}
        is_admin = orgs_list.any?{|org| org["organization"]["login"] == params[:user] }
      end
    end

    def issues_enabled
      board = huboard.board params[:user], params[:repo]
      return board.repo_exists? && board.issues_enabled?
    end
end
