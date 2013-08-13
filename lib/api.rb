require_relative "helpers"

class Huboard
  class API < HuboardApplication
    #register Sinatra::Auth::Github


    PUBLIC_URLS = ['/authorized']

    before do
#      protected! unless PUBLIC_URLS.include? request.path_info
    end

    before "/:user/:repo/?*" do 
      
      if authenticated? :private
        repo = gh.repos(params[:user], params[:repo]).raw
      else
        repo = gh.repos(params[:user], params[:repo]).raw
      end

      raise Sinatra::NotFound if repo.status == 404

    end

    helpers do
      def protected! 
        if authenticated? :private
          return
        elsif authenticated?
          return
        end
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
      backlog =  pebble.build_backlog(params[:user], params[:repo])
      backlog.merge! :logged_in => logged_in?
      return json backlog
    end

    get '/:user/:repo/board' do 
      board = pebble.board(params[:user], params[:repo])
      board.merge! :logged_in => logged_in?
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
      user, repo, number, index = params[:user], params[:repo], params[:number], params[:index]
      json pebble.reorder_issue user, repo, number, index
    end

    post '/:user/:repo/reordermilestone' do 
      user, repo, number, index = params[:user], params[:repo], params[:number], params[:index]
      json pebble.reorder_milestone user, repo, number, index
    end

    post '/:user/:repo/assigncard' do 
      issue = pebble.assign_card params[:user], params[:repo], params[:number], params[:assignee]
      publish "#{params[:user]}/#{params[:repo]}", "Assigned.#{params[:number]}", issue
      json issue
    end

    post '/:user/:repo/assignmilestone' do 
      issue = pebble.assign_milestone params[:user], params[:repo], params[:issue], params[:milestone]
      publish "#{params[:user]}/#{params[:repo]}", "Milestone.#{issue.number}", issue
      json issue
    end
    

    post '/:user/:repo/movecard' do 
      user, repo, number, index = params[:user], params[:repo], params[:number], params[:index]
      issue = pebble.move_card :user => user, :repo => repo, :number => number, :index => index
      publish "#{params[:user]}/#{params[:repo]}", "Moved.#{issue.number}", { issue: issue, index: params[:index] }
      json issue
    end

    post '/:user/:repo/close' do
      user, repo, number = params[:user], params[:repo], params[:number]
      issue = pebble.close_card user, repo, number
      publish "#{params[:user]}/#{params[:repo]}", "Closed.#{ number }", issue
      json(issue)
    end

    get '/:user/:repo/hooks' do
      json :hooks => gh.repos(params[:user],params[:repo]).hooks
    end

    get "/token" do
      return "Encrypted: #{encrypted_token}"
    end

  end
end
