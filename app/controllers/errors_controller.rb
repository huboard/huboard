class ErrorsController < ApplicationController
  layout false
  def unauthenticated
    render :unauthenticated
  end
end
