class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  rescue_from ActionController::InvalidAuthenticityToken, :with => :csrf_failed
  rescue_from Ghee::Unauthorized, :with => :ghee_unauthorized

  include ApplicationHelper

  after_action :queue_job

  protected
  def ghee_unauthorized
    request.env['warden'].logout
    respond_to do |format|
      format.json { render json: {error: 'GitHub token is expired'}, status: 422}
      format.html { redirect_to '/login' }
    end
  end
  def csrf_failed
    respond_to do |format|
      format.html { render :server_error, status: 422 }
      format.json { render json: { status: 422, error: "CSRF token is expired", message:"CSRF token is expired" }, status: 422  }
    end
  end
  def queue_job
    instance_variable_names = self.instance_variable_names.reject do |name|
      name.start_with? "@_"
    end

    instance_variable_names = instance_variable_names.reject do |name|
      self.protected_methods.any? {|method| method.to_s.delete("?!") == name.delete("@?!")}
    end

    job_params = instance_variable_names.reduce(HashWithIndifferentAccess.new) do  |hash, name| 
      hash[name.delete("@")] = self.instance_variable_get name 
      hash
    end

    job_params['current_user'] = (current_user.attribs || {}).to_h
    job_params['action_controller.params'] = params

    #TODO: make sure you can safely serialize the params
    JobResolver.find_job(params).perform_later job_params
  end

  def not_found
    raise ActionController::RoutingError.new 'Not found'
  end
end
