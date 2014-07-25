module HuBoard
  module Routes
    module Api
      class Integrations < Base
        get '/api/:user/:repo/integrations' do
          raise Sinatra::NotFound unless gh.connection.get("./repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204

          repo = gh.repos(params[:user],params[:repo])
          json couch.integrations.by_repo(repo.id)
        end

        post '/api/:user/:repo/integrations' do
          raise Sinatra::NotFound unless gh.connection.get("./repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204

          repo = gh.repos(params[:user],params[:repo])
          options = {
            github: {repo: repo.to_hash, user: current_user.attribs},
            meta: { type: "integrations" },
            integration: params[:integration],
            timestamp: Time.now.utc.iso8601
          }
          result = couch.connection.post("./", options)
          if result.status == 201
            json couch.connection.get("./#{result.body.id}").body
          else
            json result.body
          end
        end

        delete '/api/:user/:repo/integrations/:id' do
          json couch.connection.delete("./#{params[:id]}",{rev: params[:rev]}).body
        end
      end
    end
  end
end
