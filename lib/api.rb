require_relative "helpers"

module Huboard
  class API < Sinatra::Base
    register Sinatra::Auth::Github
    register Huboard::Common

    extend Huboard::Common::Settings

    before do
      authenticate! unless authenticated?
    end

    # json api
    get '/:user/:repo/milestones' do
      return json pebble.milestones(params[:user],params[:repo])
    end

    get '/:user/:repo/board' do 
      return json pebble.board(params[:user], params[:repo])
    end

    post '/:user/:repo/reorderissue' do 
      milestone = params["issue"]
      json pebble.reorder_issue params[:user], params[:repo], milestone["number"], params[:index]
    end

    post '/:user/:repo/reordermilestone' do 
      milestone = params["milestone"]
      json pebble.reorder_milestone params[:user], params[:repo], milestone["number"], params[:index], params[:status]
    end

    post '/:user/:repo/movecard' do 
      publish "#{params[:user]}/#{params[:repo]}", "Moved.#{params[:issue][:number]}", { issue:params[:issue], index: params[:index]}
      json pebble.move_card params[:user], params[:repo], params[:issue], params[:index]
    end

    post '/:user/:repo/close' do                                                               
      publish "#{params[:user]}/#{params[:repo]}", "Closed.#{params[:issue][:number]}", { issue:params[:issue]}
      json pebble.close_card params[:user], params[:repo], params[:issue]
    end

    get '/:user/:repo/hooks' do
      json :hooks => gh.repos(params[:user],params[:repo]).hooks
    end

    get "/token" do
      return "User Token: #{encrypted_token}"
    end

  end
end
