class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  skip_before_action :verify_authenticity_token, if: :json_request?

  include ApplicationHelper

  def not_found
    raise ActionController::RoutingError.new 'Not found'
  end

  :private
    def json_request?
      request.format.json?
    end

end
