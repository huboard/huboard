class LoggedInConstraint
  def matches?(request)
    request.env['warden'].authenticated?(:private) ||
      request.env['warden'].authenticated?(:default)
  end
end
