module Api
  class IssuesController < ApplicationController

    def details
      api = huboard.board(params[:user], params[:repo])
      render json: api.issue(params[:number]).activities
    end

    def create_issue
      @issue = huboard.board(params[:user],params[:repo]).create_issue params
      render json: @issue
    end

    def update_issue
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).update(params)
      render json: @issue
    end

    def close_issue
      user, repo, number = params[:user], params[:repo], params[:number]
      issue = huboard.board(user, repo).issue(number).close
      render json: issue
    end

    #TODO original api checks if comment['message'] exists
    def create_comment
      data = {body: params['markdown']}
      comment = gh.repos(params[:user], params[:repo]).
        issues(params[:number]).comments.create(data)
      render json: comment
    end

    def update_comment
      api = huboard.board(params[:user], params[:repo])
      comment = api.comments(params[:comment][:id]).patch body: params[:comment][:body]
      render json: comment
    end

    def block
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).blocked
      render json: @issue
    end

    def unblock
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).unblocked
      render json: @issue
    end

    def ready
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).ready
      render json: @issue
    end

    def unready
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).unready
      render json: @issue
    end

    #Skipping quite a bit of event code on this one since the 
    #implementation is going to be a lot different
    def drag_card
      user, repo, number, order, column = params[:user], params[:repo], params[:number], params[:order], params[:column]
      @moved = params[:moved_columns] == 'true'
      issue = huboard.board(user, repo).issue(number)
      @previous_column = issue['current_state']
      @issue = issue.move(column, order, moved)
      render json: issue
    end

    def archive_issue
      user, repo, number = params[:user], params[:repo], params[:number]
      issue = huboard.board(user, repo).archive_issue(number)
      render json: issue
    end

    def reorder_milestone
      user, repo, number, index = params[:user], params[:repo], params[:number], params[:index]
      milestone =  huboard.board(user, repo).milestone number
      render json: milestone.reorder(index)
    end

    def assign_card
      user, repo, number, assignee = params[:user], params[:repo], params[:number], params[:assignee]
      issue = huboard.board(user, repo).issue(number)
        .patch 'assignee' => assignee
      render json: issue
    end

    def assign_milestone
      user, repo, number, milestone = params[:user], params[:repo], params[:issue], params[:milestone]
      issue = huboard.board(user, repo).issue(number)
      issue.embed_data('milestone_order' => params[:order].to_f) if params[:order].to_f > 0
      issue = issue.patch 'milestone' => milestone, 'body' => issue['body']
      render json: issue
    end

  end
end
