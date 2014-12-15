module HuBoard
  module Routes
    module Api
      class Milestones < Base
        post '/api/:user/:repo/milestones' do
          milestone = huboard.board(params[:user],params[:repo])
            .create_milestone params[:milestone]

          json milestone
        end

        post '/api/:user/:repo/milestones/:number' do
          milestone = huboard.board(params[:user],params[:repo])
            .milestone(params[:number]).patch(params[:milestone])

          json milestone
        end
      end
    end
  end
end
