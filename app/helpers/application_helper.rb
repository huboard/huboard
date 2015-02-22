module ApplicationHelper
  def logged_in?
    github_authenticated?(:private) || github_authenticated?(:default)
  end
  def current_user
    user = github_user(:private) || github_user(:default)
  end
  def controller? *controller
    (controller.include?(params[:controller]) || controller.include?(params[:action])) ? "nav__btn--active nav__item--current": ''
    
  end
end
