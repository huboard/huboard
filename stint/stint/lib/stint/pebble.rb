require 'time'
require 'json'
module Stint
  class Pebble
    attr_accessor :github

    def board(user_name, repo)
      issues = get_issues(user_name, repo)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      all_labels = labels(user_name, repo)
      all_labels = all_labels.each_with_index do |label, index|
        x = issues_by_label[label[:name]]
        label[:issues] = (x || []).sort_by { |i| i["_data"]["order"] || i["number"].to_f}
        label
      end

      all_labels[0][:issues] = (issues_by_label["__nil__"] || []).concat(all_labels[0][:issues]).sort_by { |i| i["_data"]["order"] || i["number"].to_f} unless all_labels.empty?

      {
        labels: all_labels,
        milestones: milestones(user_name, repo)
      }
    end

    def get_issues(user_name, repo)
      issues = github.get_issues user_name, repo
      issues.each do |issue|
        issue["current_state"] = current_state(issue)
        issue["_data"] = embedded_data issue["body"]
      end
      issues.sort_by { |i| i["_data"]["order"] || i["number"].to_f}
    end

    def reorder_issue(user_name, repo, number, index)

      post_data = {"number" => number}
      issue = github.issue_by_id user_name, repo, number
      _data = embedded_data issue["body"]
      if _data.empty?
        post_data["body"] = issue["body"].concat "\r\n@huboard:#{JSON.dump({:order => index.to_f})}" 
      else
        post_data["body"] = issue["body"].gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge({"order" => index.to_f}))}"
      end

      github.update_issue user_name, repo, post_data
    end

    def reorder_milestone(user_name, repo, number, index)
      post_data = {:number => number}
      milestone = github.milestone user_name, repo, number
      _data = embedded_data milestone["description"]
      if _data.empty?
        post_data["description"] = milestone["description"].concat "\r\n@huboard:#{JSON.dump({:order => index.to_f})}" 
      else
        post_data["description"] = milestone["description"].gsub /@huboard:.*/, "@huboard:#{JSON.dump(_data.merge({"order" => index.to_f}))}"
      end

      github.update_milestone user_name, repo, post_data
    end

    def current_state(issue)
      r = @column_pattern
      issue["labels"].sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}  || {"name" => "__nil__"}
    end

    def priorities(user_name, repo) 
      response = github.labels(user_name, repo)
      labels = []
      response.each do |label|
        r = @priority_pattern
        puts label
        hash = r.match (label["name"])
        labels << { name: label["name"], index: hash[:id], text: hash[:name], color: label["color"]} unless hash.nil?
      end

      labels.sort_by { |l| l[:index].to_i }
    end

    def labels(user_name, repo) 
      response = github.labels(user_name, repo)
      labels = []
      response.each do |label|
        r = @column_pattern
        puts label
        hash = r.match (label["name"])
        labels << { name: label["name"], index: hash[:id], text: hash[:name], color: label["color"]} unless hash.nil?
      end

      #create labels if empty
      if labels.empty?
        # create_default_labels
      end

      labels.sort_by { |l| l[:index].to_i }
    end

    def create_default_labels

      github.create_label user_name, repo, :name => "0 - Backlog", :color => "CCCCCC"
      github.create_label user_name, repo, :name => "1 - Ready", :color => "CCCCCC"
      github.create_label user_name, repo, :name => "2 - Working", :color => "CCCCCC"
      github.create_label user_name, repo, :name => "3 - Done", :color => "CCCCCC"
      return self.labels user_name, repo
    end


    def hook_exists(user_name, repo, token)
      hooks = github.hooks user_name, repo

      return !hooks.find{ |x| x["config"]["url"] == token }.nil?
    end


    def create_hook(user_name, repo, token)

      return { message: "hook already exists", success: false  } if hook_exists user_name, repo, token

      params = {
        name:"web",
        config: {
        url: token
      },
        events: ["push"],
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

      JSON.load(match[1])
    end

    def close_card(user_name, repo, the_issue)
      github.close_issue(user_name, repo, the_issue)
    end


    def all_repos
      the_repos = github.repos
      github.orgs.each do |org|
        the_repos.concat(github.repos(org["login"]))
      end
      the_repos.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end

    def self.register(command, &block)
      @@sub ||= {}
      @@sub[command] = block
    end

    def self.deliver(payload)
      consumers = @@sub
      r = /^(?<command>[A-Z]+) GH-(?<issue>[0-9]+)/
        payload["commits"].each do |c|
        match = r.match c["message"]
        next if r.match match.nil?
        next unless consumers.has_key? match[:command]
        consumers[match[:command]].call payload, match[:issue] 
        end
    end

    def initialize(github)
      @github = github
      @column_pattern = /(?<id>\d+) *- *(?<name>.+)/
        @priority_pattern = /(?<name>.+) - (?<id>\d+)/
    end
  end
end
