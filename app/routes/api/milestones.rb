module HuBoard
  module Routes
    module Api
      class Milestones < Base
        post '/api/:user/:repo/milestones' do
          client_data = JSON.parse(request.body.read)
          milestone = huboard.board(params[:user],params[:repo])
            .create_milestone client_data

          json milestone
        end

        post '/api/:user/:repo/milestones/:number' do
          client_data = JSON.parse(request.body.read)
          milestone = huboard.board(params[:user],params[:repo])
            .milestone(params[:number]).patch(client_data)

          json milestone
        end
      end
    end
  end
end
