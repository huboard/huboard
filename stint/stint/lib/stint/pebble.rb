require 'time'
require 'json'
require 'yaml'

module Stint
  class Pebble
    attr_accessor :github

    def build_board(user_name, repo)
      issues = get_issues(user_name, repo)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      all_labels = labels(user_name, repo)
      all_labels = all_labels.each_with_index do |label, index|
        x = issues_by_label[label[:name]]
        label[:issues] = (x || []).sort_by { |i| i["_data"]["order"] || i["number"].to_f}
        label
      end

      if settings(user_name, repo)[:show_all]
        all_labels[0][:issues] = (issues_by_label["__nil__"] || []).concat(all_labels[0][:issues]).sort_by { |i| i["_data"]["order"] || i["number"].to_f} unless all_labels.empty?
      end

      {
        labels: all_labels,
        milestones: milestones(user_name, repo)
      }
    end

    def settings(user_name, repo)
      defaults = {
        :show_all => true
      }

      labels = github.labels user_name, repo

      r = /@huboard:(.*)/
      settings = labels
                  .select{|l| r.match l["name"]}
                  .map do |l|
                    match = r.match l["name"]
                    begin
                      YAML.load(match[1])
                    rescue
                      return {}
                    end
                  end.reduce(:merge)

      defaults.merge(settings || {})

    end

    def board(user_name, repo)
        board = build_board(user_name, repo)

        labels = github.labels(user_name,repo)
        labels
          .select{ |l| @link_pattern.match l["name"] }
          .each do |l|
              match = @link_pattern.match l["name"]
              user, repo = match[:user_name], match[:repo]
              begin
                linked_board = build_board user, repo
                next if linked_board[:labels].size != board[:labels].size
                board[:labels].each_with_index do |label, index|

                  linked_issues = linked_board[:labels][index][:issues].map do |i|
                    i["repo"][:color] = l["color"]
                    i
                  end

                  label[:issues] = label[:issues].concat(linked_issues).sort_by { |i| i["_data"]["order"] || i["number"].to_f}
                end 
                board[:milestones].concat(linked_board[:milestones]).sort_by { |m| m["_data"]["order"] || m["number"].to_f}

              rescue
                puts "Warning: Unable to link board: #{user}, #{repo}"
              end

          end
        return board
    end

    def get_issues(user_name, repo)
      issues = github.get_issues user_name, repo
      issues.each do |issue|
        issue["current_state"] = current_state(issue)
        issue["_data"] = embedded_data issue["body"]
        issue["repo"] = {owner: {login:user_name},name: repo}
      end
      issues.sort_by { |i| i["_data"]["order"] || i["number"].to_f}
    end

    def reorder_issue(user_name, repo, number, index)

      post_data = {"number" => number}
      issue = github.issue_by_id user_name, repo, number
      _data = embedded_data issue["body"]
      if _data.empty?
        post_data["body"] = issue["body"].concat "\r\n<!---\r\n@huboard:#{JSON.dump({:order => index.to_f})}\r\n-->\r\n" 
      else
        post_data["body"] = issue["body"].gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge({"order" => index.to_f}))}"
      end

      github.update_issue user_name, repo, post_data
    end

    def reorder_milestone(user_name, repo, number, index, status)
      post_data = {:number => number}
      milestone = github.milestone user_name, repo, number
      _data = embedded_data milestone["description"]
      if _data.empty?
        post_data["description"] = milestone["description"].concat "\r\n<!---\r\n@huboard:#{JSON.dump({"status" => status,"order" => index.to_f})}\r\n-->\r\n" 
      else
        post_data["description"] = milestone["description"].gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge({"order" => index.to_f, "status" => status}))}"
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

      return fix_hooks(user_name, repo, hooks.reject{ |x| x["name"] != "web" }.find_all{ |x| x["config"]["url"].start_with? hook_url}) 
    end

    def fix_hooks(user_name, repo, hooks)

      return false if hooks.empty?

      if hooks.size > 1
        hooks.each { |h| delete_hook user_name, repo, h }
        return false
      end

      return true if hooks.size == 1 and hooks[0]["events"].include? "issues"

      if hooks.size == 1 and !hooks[0]["events"].include? "issues"
         delete_hook user_name, repo, hooks[0] 
         return false
      end

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

    def move_card(user_name, repo, the_issue, index)
      labels = github.labels user_name, repo

      new_state = labels.find { |l| /#{index}\s*- *.+/.match(l["name"]) }

        issue = github.issue_by_id user_name, repo, the_issue["number"]

      state = current_state(issue)

      issue["labels"] << new_state unless new_state.nil?

      issue["labels"] = issue["labels"].delete_if { |l| l["name"] == state["name"] }

      github.update_issue user_name, repo, {"number" => issue["number"], "labels" => issue["labels"]}

    end

    def milestones(user_name, repo)
      milestones = github.milestones user_name, repo
      milestones = milestones.map { |m|

        m["pull_requests"] = m[:issues].select {|i| !i["pull_request"]["html_url"].nil?}
        m[:issues] = m[:issues].delete_if {|i| !i["pull_request"]["html_url"].nil?}
        m["open_issues"] = m[:issues].size
        m["_data"] = embedded_data m["description"]
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
      repos = github.repos user_name
      repos.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse 
    end

    def all_repos
      the_repos = github.repos
      github.orgs.each do |org|
        the_repos.concat(github.repos(org["login"]))
      end
      the_repos.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end

    def initialize(github)
      @github = github
      @column_pattern = /(?<id>\d+) *- *(?<name>.+)/
      @priority_pattern = /(?<name>.+) - (?<id>\d+)/
      @link_pattern = /Link <=> (?<user_name>.*)\/(?<repo>.*)/
    end
  end
end
