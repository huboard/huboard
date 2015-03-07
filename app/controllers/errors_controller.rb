class ErrorsController < ApplicationController
  layout false
  def unauthenticated
    render :unauthenticated, status: 403
  end
  def not_found
    render [:not_found, :not_found_b].sample, status: 404
  end
  def unprocessable_entity
    render :server_error, status: 422
  end
  def server_error
    render :server_error, status: 500
  end
end
