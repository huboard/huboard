module Saas
  class ErrorsController < Saas::ApplicationController
    layout false
    def unauthenticated_saas
      respond_to do |format|
        format.html {render :unauthenticated_saas, status: 403}
        format.json { render json: { error: "Unauthenticated" }, status: 403}
      end
    end
    helper_method :is_owner
    helper_method :issues_enabled
    helper_method :upgrade_url
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
     
    def upgrade_url
      account_type = gh.users(params[:user])["type"]
      if account_type == "User"
        "/settings/profile"
      elsif account_type == "Organization"
        "/settings/profile/#/#{params[:user]}"
      end
    end

    def issues_enabled
      board = huboard.board params[:user], params[:repo]
      return board.repo_exists? && board.issues_enabled?
    end
  end
end
