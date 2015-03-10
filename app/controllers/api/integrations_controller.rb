module Api
  class IntegrationsController < ApplicationController
    def index
      not_found unless gh.connection.get("./repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204

      repo = gh.repos(params[:user],params[:repo])
      render json: couch.integrations.by_repo(repo['id'])
    end
    def create
      not_found unless gh.connection.get("./repos/#{params[:user]}/#{params[:repo]}/collaborators/#{current_user.login}").status == 204

      repo = gh.repos(params[:user],params[:repo])
      options = {
        github: {repo: repo.to_hash, user: current_user.attribs},
        meta: { type: "integrations" },
        integration: params[:integration],
        timestamp: Time.now.utc.iso8601
      }
      result = couch.connection.post("./", options)
      if result.status == 201
        render json: couch.connection.get("./#{result.body.id}").body
      else
        render json: result.body
      end
    end
    def destroy
      render json: couch.connection.delete("./#{params[:id]}",{rev: params[:rev]}).body
    end
  end
end
