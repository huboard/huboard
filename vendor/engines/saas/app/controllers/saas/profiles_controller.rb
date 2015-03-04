module Saas
  class ProfilesController < Saas::ApplicationController
    def show
      render :show, layout: "application"
    end
  end
end
