require 'bridge/huboard'
module ApplicationHelper
  def logged_in?
    github_authenticated?(:private) || github_authenticated?(:default)
  end
  def current_user
    github_user(:private) || github_user(:default)
  end
  def controller? *controller
    (controller.include?(params[:controller]) || controller.include?(params[:action])) ? "nav__btn--active nav__item--current": ''
  end
  def user_token
    current_user ? current_user.token : nil
  end
  def github_config
    {
      client_id: ENV['GITHUB_CLIENT_ID'],
      client_secret: ENV['GITHUB_SECRET'],
    }
  end
  def huboard(token = nil)
    Huboard::Client.new(token || user_token, github_config)
  end
  def gh
    huboard.connection
  end
  def emojis
    @emojis ||= gh.connection.get('./emojis').body
  end
  def couch
    @couch ||= HuBoard::Couch.new :base_url => ENV["COUCH_URL"], :database => ENV["COUCH_DATABASE"]
  end
end
