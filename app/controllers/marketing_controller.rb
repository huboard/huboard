class MarketingController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  include ApplicationHelper

  def index
    render template: "marketing/marketing", layout: "marketing"
  end

  def integrations
      render template: "marketing/integrations", layout: "marketing"
  end

  def pricing
      render template: "marketing/pricing", layout: "marketing"
  end
end
