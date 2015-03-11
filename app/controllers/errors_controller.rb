class ErrorsController < ApplicationController
  layout false
  def unauthenticated
    respond_to do |format|
      format.html {render :unauthenticated, status: 403}
      format.json { render json: { status: 403, error: "Unauthenticated" }}
    end
  end
  def not_found
    respond_to do |format|
      format.html {render [:not_found, :not_found_b].sample, status: 404}
      format.json { render json: { status: 404, error: "Not found" }}
    end
  end
  def unprocessable_entity
    @exception = env["action_dispatch.exception"]
    respond_to do |format|
      format.html {render :server_error, status: 422 }
      format.json { render json: { status: 422, error: @exception.message }}
    end
  end
  def server_error
    @exception = env["action_dispatch.exception"]
    respond_to do |format|
      format.html {render :server_error, status: 500 }
      format.json { render json: { status: 500, error: @exception.message }}
    end
  end
end
