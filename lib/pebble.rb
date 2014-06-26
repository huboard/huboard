require 'time'
require 'json'
require 'yaml'

module Stint
  class Pebble
    attr_accessor :github, :huboard

    def build_backlog(user_name, repo)
      return huboard.board(user_name, repo).backlog
    end

    def build_board(user_name, repo)
      return huboard.board(user_name, repo).board
    end

    def backlog_column_for(user_name, repo) 
      adapter = huboard.board(user_name, repo)

      return adapter.settings[:show_all] ?  adapter.backlog_column : { :issues =>[] } 
    end

    def backlog_column(user_name, repo)
      adapter = huboard.board(user_name, repo)

      column = backlog_column_for(user_name, repo) 

      linked = adapter.link_labels.each do |l| 
        begin
          issues = backlog_column_for(l.user, l.repo)[:issues].map do |i|
            #ugly
            i["repo"][:color] = l.color
            i
          end
          column[:issues] = column[:issues].concat(issues).sort_by {|i| i.order }
        rescue
          puts "Warning: Unable to link board: #{l.user}, #{l.repo}"
        end
      end

      return column
    end

    def board(user_name, repo)
      adapter = huboard.board(user_name, repo)

      linked = adapter.link_labels

      board = adapter.board

      linked.each do |l|
        begin
          api = huboard.board(l.user, l.repo)

          board = api.merge board, api.board, l
        rescue
          puts "Warning: Unable to link board: #{l.user}, #{l.repo}"
        end
      end

      return board
    end

    def feed_for_issue(user, repo, number)
      api = huboard.board(user, repo)

      issue = api.issue(number).feed

      actions = { :actions => {
        :labels => {
        :available_labels => api.other_labels,
        :current_labels => issue["other_labels"]
      }
      }
      }

      { :issue => issue }.merge! actions

    end

    def update_issue_labels(user, repo, number, labels)
      issue = huboard.board(user, repo).issue number
      issue.update_labels labels
    end

    def reorder_milestone(user_name, repo, number, index)
      milestone =  huboard.board(user_name, repo).milestone number
      milestone.reorder index
    end

    def reorder_issue(user_name, repo, number, index)
      issue = huboard.board(user_name, repo).issue(number)
      issue.reorder(index)
    end

    def assign_card(user_name, repo, the_issue, assignee)
      issue = huboard.board(user_name, repo).issue(the_issue)
      issue.patch "assignee" => assignee
    end

    def assign_milestone(user_name, repo, the_issue, milestone)
      issue = huboard.board(user_name, repo).issue(the_issue)
      issue.patch "milestone" => milestone
    end

    def move_card(params)
      issue = huboard.board(params[:user], params[:repo]).issue(params[:number])
      issue.move params[:index]
    end

    def close_card(user_name, repo, the_issue)
      issue = huboard.board(user_name, repo).issue(the_issue)
      issue.close
    end

    def initialize(github, huboard)
      @github = github
      @huboard = huboard
    end
  end
end
