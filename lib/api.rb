require_relative "helpers"

class Huboard
  class API < Sinatra::Base
    register Sinatra::Auth::Github
    register Huboard::Common

    extend Huboard::Common::Settings

    PUBLIC_URLS = ['/authorized']

    before do
      protected! unless PUBLIC_URLS.include? request.path_info
    end

    helpers do
      def protected! 
        return current_user if authenticated?
        authenticate! 
      end
    end

    # json api

    get '/authorized' do
      token = params[:token]
      begin
        token = decrypt_token token
      rescue
       halt([401, "Bad token"])
      end

      halt([401, "Unauthorized User"]) unless check_token(token)
      "Authorized yo!"
    end

    get '/:user/:repo/backlog' do 
      return json pebble.build_backlog(params[:user], params[:repo])
    end

    get '/:user/:repo/board' do 
      board =  pebble.board(params[:user], params[:repo])
      couch.boards.save(board)
      return json board
    end

    get '/:user/:repo/column' do 
      return json pebble.backlog_column(params[:user], params[:repo])
    end

    get '/:user/:repo/issues/:number/feed' do 
      return json pebble.feed_for_issue(params[:user], params[:repo], params[:number])

    end
    post '/:user/:repo/issues/:number/update_labels' do 
      labels = params[:labels] ? params[:labels][:name] : []
      issue = pebble.update_issue_labels(params[:user], params[:repo], params[:number], labels).to_hash

      publish "#{params[:user]}/#{params[:repo]}", "Updated.#{params[:number]}", { issue: issue }

      return json  issue

    end

    post '/:user/:repo/reorderissue' do 
      milestone = params["issue"]
      json pebble.reorder_issue params[:user], params[:repo], milestone["number"], params[:index]
    end

    post '/:user/:repo/reordermilestone' do 
      milestone = params["milestone"]
      json pebble.reorder_milestone params[:user], params[:repo], milestone["number"], params[:index], params[:status]
    end

    post '/:user/:repo/assigncard' do 
      issue = pebble.assign_card params[:user], params[:repo], params[:issue], params[:assignee]
      publish "#{params[:user]}/#{params[:repo]}", "Assigned.#{params[:issue][:number]}", issue
      json issue
    end

    post '/:user/:repo/assignmilestone' do 
      issue = pebble.assign_milestone params[:user], params[:repo], params[:issue], params[:milestone]
      publish "#{params[:user]}/#{params[:repo]}", "Milestone.#{params[:issue][:number]}", issue
      json issue
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
      return "Encrypted: #{encrypted_token}"
    end

  end
end
