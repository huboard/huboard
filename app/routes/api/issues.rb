module HuBoard
  module Routes
    module Api
      class Issues < Base

        post '/api/:user/:repo/issues' do
          issue = huboard.board(params[:user],params[:repo]).create_issue params

          IssueOpenedEvent.new.publish issue, current_user.attribs, params["correlationId"]

          json issue
        end

        ## Edit a comment
        #  Accepts a params[:comment]
        #  Returns json of comment
        put '/api/:user/:repo/issues/comments/:id' do
          api = huboard.board(params[:user], params[:repo])

          comment = api.comments(params[:comment][:id]).patch body: params[:comment][:body]

          json(comment)
        end
        post '/api/:user/:repo/issues/:number/comment' do
          data = {body: params["markdown"]}
          comment = gh.repos(params[:user], params[:repo]).issues(params[:number]).comments.create data

          json comment.to_hash
        end

        get '/api/:user/:repo/issues/:number/details' do
          api = huboard.board(params[:user], params[:repo])

          issue = api.issue(params[:number]).activities

          json issue
        end

        put '/api/:user/:repo/issues/:number' do
          api = huboard.board(params[:user], params[:repo])

          issue = api.issue(params[:number]).update(params).to_hash

          json issue
        end

        put '/api/:user/:repo/issues/:number/blocked' do
          api = huboard.board(params[:user], params[:repo])
          issue = api.issue(params[:number]).blocked

          IssueStatusChangedEvent.new.publish issue, "blocked", current_user.attribs, params[:correlationId]

          json issue
        end

        delete '/api/:user/:repo/issues/:number/blocked' do
          api = huboard.board(params[:user], params[:repo])
          issue = api.issue(params[:number]).unblocked

          IssueStatusChangedEvent.new.publish issue, "unblocked", current_user.attribs, params[:correlationId]

          json issue
        end

        put '/api/:user/:repo/issues/:number/ready' do
          api = huboard.board(params[:user], params[:repo])
          issue = api.issue(params[:number]).ready

          IssueStatusChangedEvent.new.publish issue, "ready", current_user.attribs, params[:correlationId]

          json issue
        end

        delete '/api/:user/:repo/issues/:number/ready' do
          api = huboard.board(params[:user], params[:repo])
          issue = api.issue(params[:number]).unready

          IssueStatusChangedEvent.new.publish issue, "unready", current_user.attribs, params[:correlationId]

          json issue
        end

        post '/api/:user/:repo/dragcard' do
          user, repo, number, order, column = params[:user], params[:repo], params[:number], params[:order], params[:column]
          moved = params[:moved_columns] == "true"
          issue = huboard.board(user, repo).issue(number)
          previous_column = issue.current_state
          issue = issue.move(column, order, moved)

          if previous_column["name"] == "__nil__"
            previous_column = huboard.board(user, repo).column_labels.first
          end

          if moved
            IssueMovedEvent.new.publish issue, previous_column, current_user.attribs, params[:correlationId]
          else
            IssueReorderedEvent.new.publish issue, current_user.attribs, params[:correlationId]
          end

          json issue
        end

        post '/api/:user/:repo/archiveissue' do
          user, repo, number = params[:user], params[:repo], params[:number]
          issue = huboard.board(user, repo).archive_issue(number)
          IssueArchivedEvent.new.publish issue, current_user.attribs, params[:correlationId]
          json issue
        end

        post '/api/:user/:repo/reordermilestone' do
          user, repo, number, index = params[:user], params[:repo], params[:number], params[:index]
          milestone =  huboard.board(user, repo).milestone number
          json milestone.reorder index
        end

        post '/api/:user/:repo/assigncard' do
          user, repo, number, assignee = params[:user], params[:repo], params[:number], params[:assignee]
          issue = huboard.board(user, repo).issue(number)
          issue = issue.patch "assignee" => assignee

          IssueAssignedEvent.new.publish issue, current_user.attribs, params[:correlationId]

          json issue
        end

        post '/api/:user/:repo/assignmilestone' do
          user, repo, number, milestone = params[:user], params[:repo], params[:issue], params[:milestone]

          issue = huboard.board(user, repo).issue(number)
          issue.embed_data("milestone_order" => params[:order].to_f) if params[:order].to_f > 0
          issue = issue.patch "milestone"    => milestone, "body" => issue.body

          if params[:changed_milestones] == "true"
            IssueMilestoneChangedEvent.new.publish issue, current_user.attribs, params[:correlationId]
          end

          json issue
        end

        post '/api/:user/:repo/close' do
          user, repo, number = params[:user], params[:repo], params[:number]
          issue = huboard.board(user, repo).issue(number).close

          IssueClosedEvent.new.publish issue, current_user.attribs, params[:correlationId]

          json(issue)
        end
      end
    end
  end
end
