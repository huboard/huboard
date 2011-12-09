require 'time'
module Stint
  class Pebble
    attr_accessor :github

    def initialize(github)
      @github = github
    end

    def board(user_name, repo)
      issues = get_issues(user_name, repo)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      all_labels = labels(user_name, repo)
      all_labels = all_labels.map do |label|
        x = issues_by_label[label[:name]]
        label[:issues] = x || []
        label
      end
      {
        labels: all_labels,
        milestones: github.milestones(user_name, repo)
      }
    end

    def get_issues(user_name, repo)
      issues = github.get_issues user_name, repo
      issues.each do |issue|
        issue["current_state"] = current_state(issue)
      end
      issues
    end

    def reorder_milestone(user_name, repo, number, index)
      years = 10 + index.to_i
      time = Time.now + (years*52*7*24*60*60)

      post_data = { due_on: time.utc.iso8601, number:number }
      github.update_milestone user_name, repo, post_data
    end

    def current_state(issue)
      r = /(?<id>\d+) *- *(?<name>.+)/
      issue["labels"].sort_by {|l| l["name"]}.reverse.find {|x| r.match(x["name"])}  || {"name" => "0 - None"}
    end

    def labels(user_name, repo) 
      response = github.labels(user_name, repo)
      labels = []
      response.each do |label|
        r = /(?<id>\d+) *- *(?<name>.+)/
        puts label
        hash = r.match (label["name"])
        labels << { name: label["name"], index: hash[:id], text: hash[:name], color: label["color"]} unless hash.nil?
      end

      labels.sort_by { |l| l[:index].to_i }
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
      return "no match" unless /push/i.match( match[:command])  

      issue = github.issue_by_id user_name, repo, match[:issue]

      #return issue
      state = current_state(issue)

      sr = /(?<id>\d+) *- *(?<name>.+)/.match(state["name"])
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
  end
end
