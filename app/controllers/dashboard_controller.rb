class DashboardController < ApplicationController
  def index
    @repos = huboard.all_repos
  end
end
