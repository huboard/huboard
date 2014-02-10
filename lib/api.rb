require_relative "helpers"

class Huboard
  class API < HuboardApplication
    #register Sinatra::Auth::Github


    PUBLIC_URLS = ['/authorized']
    RESERVED_URLS = %w{ settings profiles v2 webhook }


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

    get '/:user/:repo/board' do 
       return json huboard.board(params[:user],params[:repo]).meta
    end

    get '/:user/:repo/linked/:linked_user/:linked_repo' do 
      board = huboard.board(params[:user], params[:repo])
      if board.linked? params[:linked_user], params[:linked_repo]
        json board.linked(params[:linked_user], params[:linked_repo])
      else
        json({failure: true, message: "couldn't link board"})
      end
    end

    post '/:user/:repo/issues' do 
       return json huboard.board(params[:user],params[:repo]).create_issue JSON.parse(request.body.read)
    end

    post '/:user/:repo/issues/:number/comment' do 

      comment = gh.repos(params[:user], params[:repo]).issues(params[:number])
              .comments.create :body => JSON.parse(request.body.read)["markdown"]

      return json comment.to_hash

    end

    put '/:user/:repo/issues/:number' do 

      api = huboard.board(params[:user], params[:repo])

      issue = api.issue(params[:number]).update(JSON.parse(request.body.read)).to_hash

      return json issue

    end

    put '/:user/:repo/issues/:number/blocked' do 

      api = huboard.board(params[:user], params[:repo])
      issue = api.issue(params[:number]).blocked

      return json issue 
    end

    delete '/:user/:repo/issues/:number/blocked' do 

      api = huboard.board(params[:user], params[:repo])
      issue = api.issue(params[:number]).unblocked

      return json issue 
    end

    put '/:user/:repo/issues/:number/ready' do 

      api = huboard.board(params[:user], params[:repo])
      issue = api.issue(params[:number]).ready

      return json issue 
    end

    delete '/:user/:repo/issues/:number/ready' do 

      api = huboard.board(params[:user], params[:repo])
      issue = api.issue(params[:number]).unready

      return json issue 
    end

    get '/:user/:repo/issues/:number/details' do 
      api = huboard.board(params[:user], params[:repo])

      issue = api.issue(params[:number]).activities

      return json issue
    end

    post '/:user/:repo/dragcard' do 
      user, repo, number, order, column = params[:user], params[:repo], params[:number], params[:order], params[:column]
      moved = params[:moved_columns] == "true"
      issue = huboard.board(user, repo).issue(number).move(column, order, moved)

      if moved
        IssueMovedEvent.new.publish issue, current_user, params[:correlationId]
      else
        IssueReorderedEvent.new.publish issue, current_user, params[:correlationId]
      end

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

      IssueAssignedEvent.new.publish issue, current_user, params[:correlationId]

      json issue
    end

    post '/:user/:repo/assignmilestone' do 
      issue = pebble.assign_milestone params[:user], params[:repo], params[:issue], params[:milestone]

      IssueMilestoneChangedEvent.new.publish issue, current_user, params[:correlationId]
      json issue
    end
    
    post '/:user/:repo/close' do
      user, repo, number = params[:user], params[:repo], params[:number]
      issue = huboard.board(user, repo).issue(number).close

      IssueClosedEvent.new.publish issue, current_user, params[:correlationId]

      json(issue)
    end

    get '/:user/:repo/hooks' do
      json :hooks => gh.repos(params[:user],params[:repo]).hooks
    end

    post '/webhook/issue' do
      LogWebhookJob.new.log params
      json :message => "Webhook received"
    end

    post '/webhook/comment' do
      LogWebhookJob.new.log params
      json :message => "Webhook received"
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
