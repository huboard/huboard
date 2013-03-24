require 'time'
require 'json'
require 'yaml'
require_relative 'bridge/huboard'

module Stint
  class Pebble
    attr_accessor :github

    def build_backlog(user_name, repo)
      issues = get_issues user_name, repo, 0, false
      milestones = github.get_milestones(user_name, repo)
        .map {|m| {
            :milestone => m.merge(:_data => embedded_data(m["description"]).reject {|key| key.to_s == "status" }),
            :issues => issues.find_all {|i| i["milestone"] && i["milestone"]["number"] == m["number"]}
            }
        }.sort_by { |m| m[:milestone]["_data"]["order"] || m[:milestone]["number"].to_f}

      return :milestones => milestones, 
        :unassigned => {:issues => issues.find_all {|i| i.milestone.nil? }, :milestone => {:title => "No milestone"}},
        :assignees =>  github.assignees(user_name, repo).map{|a| a},
        other_labels: Huboard.board_for(user_name, repo).other_labels
    end

    def build_board(user_name, repo)
      include_backlog = settings(user_name, repo)[:show_all]
      issues = get_issues(user_name, repo, include_backlog ? 1 : 0)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      all_labels = labels(user_name, repo)
      all_labels = all_labels.each_with_index do |label, index|
        x = issues_by_label[label[:name]]
        label[:issues] = (x || []).sort_by { |i| i["_data"]["order"] || i["number"].to_f}
        label
      end

      if include_backlog
        all_labels[0][:issues] = (issues_by_label["__nil__"] || []).concat(all_labels[0][:issues]).sort_by { |i| i["_data"]["order"] || i["number"].to_f} unless all_labels.empty?
      end

      {
        labels: all_labels,
        milestones: get_milestones(user_name, repo),
        other_labels: github.labels(user_name, repo).reject { |l| @huboard_patterns.any?{|p| p.match(l["name"]) } }
      }
    end

    def backlog_column(user_name, repo) 
      return {issues: []} unless settings(user_name, repo)[:show_all]

      issues = get_issues(user_name, repo, 0, false)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      backlog_label = labels(user_name, repo).first
      concated_issues = (issues_by_label["__nil__"] || []).concat(issues_by_label[backlog_label[:name]] || []).sort_by { |i| i["_data"]["order"] || i["number"].to_f}

      return { issues: concated_issues }
    end

    def settings(user_name, repo)
      Huboard.board_for(user_name,repo).settings
    end

    def board(user_name, repo)
        labels = github.labels(user_name,repo)

        board = build_board(user_name, repo)

        labels
          .select{ |l| @link_pattern.match l["name"] }
          .each do |l|
              match = @link_pattern.match l["name"]
              linked_user, linked_repo = match[:user_name], match[:repo]
              begin
                linked_board = build_board linked_user, linked_repo
                next if linked_board[:labels].size != board[:labels].size
                board[:labels].each_with_index do |label, index|

                  linked_issues = linked_board[:labels][index][:issues].map do |i|
                    i["repo"][:color] = l["color"]
                    i
                  end

                  label[:issues] = label[:issues].concat(linked_issues).sort_by { |i| i["_data"]["order"] || i["number"].to_f}
                end 
                board[:milestones].concat(linked_board[:milestones]).sort_by { |m| m["_data"]["order"] || m["number"].to_f}
                board[:other_labels].concat(linked_board[:other_labels])

              rescue
                puts "Warning: Unable to link board: #{linked_user}, #{linked_repo}"
              end

          end
        # labels have to share the exact same color to work
        board[:other_labels] = board[:other_labels].group_by { |l| l["name"].downcase }.map{|k,v| v.first }

        board[:milestones] = board[:milestones].group_by { |l| l["title"].downcase }.map{|k,v| v.first }
        board[:assignees] = github.assignees(user_name, repo).map{|a| a}
        return board
    end

    def get_issues(user_name, repo, skip = 0, optimize = true)
      board = Huboard.board_for user_name, repo


      if optimize
        columns = board.column_labels.drop(skip)
        issues = columns.map { |c| board.issues(c[:name]) }.flat_map {|i| i }
      else
        issues = board.issues
      end

      issues
    end

    def reorder_issue(user_name, repo, number, index)

      issue = Huboard.board_for(user_name, repo).issue(number)
      issue.reorder(index)
    end

    def feed_for_issue(user, repo, number)
      issue = github.feed_for_issue user, repo, number
      issue["other_labels"] = issue["labels"].reject {|l| @huboard_patterns.any? {|p| p.match(l["name"])}}

      actions = { :actions => {
          :labels => {
            :available_labels => github.labels(user, repo).reject {|l| @huboard_patterns.any? {|p| p.match(l["name"])}},
            :current_labels => issue["other_labels"]
          }
        }
      }

      { :issue => issue }.merge! actions
      
    end

    def update_issue_labels(user, repo, number, labels)
      issue = github.issue_by_id user, repo, number

      keep_labels = issue["labels"].find_all {|l| @huboard_patterns.any? {|p| p.match(l["name"])}}

      update_with = labels.concat(keep_labels.map{ |l| l["name"] }) 

      updated = github.update_issue user, repo, { "number" => issue.number, :labels => update_with }

      updated["other_labels"] = updated["labels"].reject {|l| @huboard_patterns.any? {|p| p.match(l["name"])}}.map { |x| x }

      updated

    end

    def reorder_milestone(user_name, repo, number, index, status)
      post_data = {:number => number}
      milestone = github.milestone user_name, repo, number
      _data = embedded_data(milestone["description"]).reject { |key| key.to_s == "status" }
      if _data.empty?
        post_data["description"] = milestone["description"].concat "\r\n\r\n<!---\r\n@huboard:#{JSON.dump({"order" => index.to_f})}\r\n-->\r\n" 
      else
        post_data["description"] = milestone["description"].gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge({"order" => index.to_f}))}"
      end

      github.update_milestone user_name, repo, post_data
    end

    def current_state(issue)
      r = @column_pattern
      issue["labels"].sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}  || {"name" => "__nil__"}
    end


    def labels(user_name, repo) 
      response = github.labels(user_name, repo)
      labels = []
      response.each do |label|
        r = @column_pattern
        hash = r.match (label["name"])
        labels << { name: label["name"], index: hash[:id], text: hash[:name], color: label["color"]} unless hash.nil?
      end

      labels.sort_by { |l| l[:index].to_i }
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

    def push_card(user_name, repo, commit)
      r = /(?<command>\w+) [gG][hH]-+(?<issue>\d+)/
        match = r.match(commit["message"])
      return "no match" unless match
      return "no match" unless /push|pushes|moves?/i.match( match[:command])  

      issue = github.issue_by_id user_name, repo, match[:issue]

      #return issue
      state = current_state(issue)

      sr = @column_pattern
      next_state = sr.nil? ? 0 : (sr[:id].to_i + 1)

      labels = github.labels user_name, repo

      next_label = labels.find { |l| /#{next_state}\s*- *.+/.match(l["name"]) }

        return github.close_issue(user_name, repo, issue) if next_label.nil?

      issue["labels"] << next_label

      issue["labels"] = issue["labels"].delete_if { |l| l["name"] == state["name"] }

      github.update_issue user_name, repo, {"number" => issue["number"],"labels" => issue["labels"]}
    end

    def assign_card(user_name, repo, the_issue, assignee)
      github.update_issue user_name, repo, {"number" => the_issue["number"], "assignee" => assignee}
    end

    def assign_milestone(user_name, repo, the_issue, milestone)
      number = milestone["number"] 
      github.update_issue user_name, repo, {"number" => the_issue["number"], "milestone" => number}
    end

    def move_card(user_name, repo, the_issue, index)
      labels = github.labels user_name, repo

      new_state = labels.find { |l| /#{index}\s*- *.+/.match(l["name"]) }

        issue = github.issue_by_id user_name, repo, the_issue["number"]

      state = current_state(issue)

      issue["labels"] << new_state unless new_state.nil?

      issue["labels"] = issue["labels"].delete_if { |l| l["name"] == state["name"] }

      github.update_issue user_name, repo, {"number" => issue["number"], "labels" => issue["labels"]}

    end

    def get_milestones(user_name, repo)
      milestones = github.get_milestones user_name, repo
      milestones = milestones.map { |m|
        m["_data"] = embedded_data( m["description"]).reject { |key| key.to_s == "status" }
        m
      }
      milestones.sort_by { |m| m["_data"]["order"] || m["number"].to_f}

    end

    def milestones(user_name, repo)
      milestones = github.milestones user_name, repo
      milestones = milestones.map { |m|
        m["pull_requests"] = m[:issues].select {|i| !i["pull_request"]["html_url"].nil?}
        m[:issues] = m[:issues].delete_if {|i| !i["pull_request"]["html_url"].nil?}
        m["open_issues"] = m[:issues].size
        m["_data"] = embedded_data( m["description"]).reject { |key| key.to_s == "status" }
        m
      }
      milestones.sort_by { |m| m["_data"]["order"] || m["number"].to_f}
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
      github.close_issue(user_name, repo, the_issue)
    end

    def repos(user_name = nil)
      Huboard.repos(user_name)
    end

    def all_repos
      Huboard.all_repos
    end

    def initialize(github)
      @github = github
      @column_pattern = Huboard.column_pattern
      @link_pattern =   Huboard.link_pattern
      @settings_pattern = Huboard.settings_pattern
      @huboard_patterns = Huboard.all_patterns
    end
  end
end
