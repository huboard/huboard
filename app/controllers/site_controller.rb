class SiteController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  include ApplicationHelper

  def terms
    render template: "site/terms", layout: "marketing"
  end

  def privacy
    render template: "site/privacy", layout: "marketing"
  end

end
