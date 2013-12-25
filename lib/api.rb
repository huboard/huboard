require_relative "helpers"

class Huboard
  class API < HuboardApplication
    #register Sinatra::Auth::Github


    PUBLIC_URLS = ['/authorized']
    RESERVED_URLS = %w{ settings profiles v2 }


    before "/:user/:repo/?*" do 
      
      return if RESERVED_URLS.include? params[:user]

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

    get '/v2/:user/:repo/board' do 
       return json huboard.board(params[:user],params[:repo]).meta
    end
    get '/v2/:user/:repo/linked/:linked_user/:linked_repo' do 
      board = huboard.board(params[:user], params[:repo])
      if board.linked? params[:linked_user], params[:linked_repo]
        json board.linked(params[:linked_user], params[:linked_repo])
      else
        json({failure: true, message: "couldn't link board"})
      end
    end

    post '/v2/:user/:repo/issues/create' do 
       return json huboard.board(params[:user],params[:repo]).create_issue JSON.parse(request.body.read)
    end

    post '/:user/:repo/issues/:number/comment' do 

      comment = gh.repos(params[:user], params[:repo]).issues(params[:number])
              .comments.create :body => JSON.parse(request.body.read)["markdown"]

      return json comment.to_hash

    end

    post '/:user/:repo/issues/:number/update' do 

      api = huboard.board(params[:user], params[:repo])

      issue = api.issue(params[:number]).update(JSON.parse(request.body.read)).to_hash

      return json issue

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

    get '/:user/:repo/issues/:number/details' do 
      api = huboard.board(params[:user], params[:repo])

      issue = api.issue(params[:number]).activities

      return json issue

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

    post '/:user/:repo/dragcard' do 
      user, repo, number, order, column = params[:user], params[:repo], params[:number], params[:order], params[:column]
      issue = huboard.board(user, repo).issue(number).move(column, order)
      publish "#{params[:user]}/#{params[:repo]}", "Moved.#{issue.number}", { issue: issue, index: params[:column] }
      json issue
    end

    post '/:user/:repo/archiveissue' do 
      user, repo, number = params[:user], params[:repo], params[:number]
      json huboard.board(user, repo).archive_issue(number)
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

    get '/profiles/?' do
      user = gh.user.to_hash
      orgs = gh.orgs.to_a

      json :user => user, :orgs => orgs
    end

    get '/profiles/user/?' do 
      user = gh.user
      user.merge! :billing_email => user.email

      customer =  couch.customers.findPlanById(user.id)
      plans_doc =  couch.connection.get("./plans").body

      plans =  plans_doc.stripe[plans_doc.meta.mode]["User"]

      plans = plans.map do |plan|
        plan.merge! :purchased => customer.rows.any? { |row| row.value.stripe.plan.plan_id == plan.plan_id}
      end

      json :org => user.to_hash, 
        :plans => plans,
        :card => customer.rows.any? ? customer.rows.map {|cust| cust.value.stripe.customer.cards.data.find {|card| card.id == cust.value.stripe.customer.default_card }}.first : nil,
        :is_owner => true,
        :has_plan => customer.rows.size > 0
    end

    get '/profiles/:org/?' do 

      org = gh.orgs(params[:org])
      is_owner = gh.orgs(params[:org]).teams.any? { |t| t.name == "Owners" }
      org.merge! :is_owner => is_owner

      customer =  couch.customers.findPlanById(org.id)
      plans_doc =  couch.connection.get("./plans").body

      plans =  plans_doc.stripe[plans_doc.meta.mode]["Organization"]

      plans = plans.map do |plan|
        plan.merge! :purchased => customer.rows.any? { |row| row.value.stripe.plan.plan_id == plan.plan_id}
      end

      json :org => org.to_hash, 
        :plans => plans,
        :card => customer.rows.any? ? customer.rows.map {|cust| cust.value.stripe.customer.cards.data.find {|card| card.id == cust.value.stripe.customer.default_card }}.first : nil,
        :is_owner => is_owner,
        :has_plan => customer.rows.size > 0
    end

    get "/token" do
      return "Encrypted: #{encrypted_token}"
    end

  end
end
