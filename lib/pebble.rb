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
          api = Huboard.adapter_for(l.user, l.repo)

          board = api.merge board, api.board, l
        rescue
          puts "Warning: Unable to link board: #{l.user}, #{l.repo}"
        end
      end

      return board
    end


    def reorder_issue(user_name, repo, number, index)
      issue = Huboard.adapter_for(user_name, repo).issue(number)
      issue.reorder(index)
    end

    def feed_for_issue(user, repo, number)
      api = Huboard.adapter_for(user, repo)

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
      issue = Huboard.adapter_for(user, repo).issue number
      issue.update_labels labels
    end

    def reorder_milestone(user_name, repo, number, index, status)

      milestone =  Huboard.adapter_for(user_name, repo).milestone number

      milestone.reorder index

    end



    def create_board(user_name, repo, hook)
      github.create_label user_name, repo, :name => "0 - Backlog", :color => "CCCCCC"
      github.create_label user_name, repo, :name => "1 - Ready", :color => "CCCCCC"
      github.create_label user_name, repo, :name => "2 - Working", :color => "CCCCCC"
      github.create_label user_name, repo, :name => "3 - Done", :color => "CCCCCC"
      create_hook user_name, repo, hook
    end


    def hook_exists(user_name, repo, token)
      hooks = github.hooks user_name, repo

      uri = URI.parse(token)

      hook_url = uri.to_s.gsub(uri.query,"")

      hooks.reject{ |x| x["name"] != "web" }.find_all{ |x| x["config"]["url"].start_with? hook_url}.size > 0

    end

    def fix_hooks(user_name, repo, hooks)
      hooks.each { |h| delete_hook user_name, repo, h }
    end

    def delete_hook(user_name, repo, hook)
      github.delete_hook(user_name, repo, hook["id"])
    end

    def create_hook(user_name, repo, token)

      return { message: "hook already exists", success: false  } if hook_exists user_name, repo, token

      params = {
        name:"web",
        config: {
        url: token
      },
        events: ["issues"],
        active: true
      }
      github.create_hook( user_name, repo, params).merge( { success: true, message: "hook created successfully"})
    end


    def assign_card(user_name, repo, the_issue, assignee)
      issue = Huboard.adapter_for(user_name, repo).issue(the_issue["number"])
      issue.patch "assignee" => assignee
    end

    def assign_milestone(user_name, repo, the_issue, milestone)
      issue = Huboard.adapter_for(user_name, repo).issue(the_issue["number"])
      issue.patch "milestone" => milestone["number"]
    end

    def move_card(user_name, repo, the_issue, index)
      issue = Huboard.adapter_for(user_name, repo).issue(the_issue["number"])
      issue.move index
    end

    def embedded_data(body)
      r = /@huboard:(.*)/
        match = r.match body
      return { } if match.nil?

      begin
        JSON.load(match[1])
      rescue
        return {}
      end
    end

    def close_card(user_name, repo, the_issue)
      issue = Huboard.adapter_for(user_name, repo).issue(the_issue["number"])
      issue.close
    end

    def repos(user_name = nil)
      Huboard.repos(user_name)
    end

    def all_repos
      Huboard.all_repos
    end

    def initialize(github, huboard)
      @github = github
      @huboard = huboard
    end
  end
end
