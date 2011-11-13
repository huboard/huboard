module Stint

  class Pebble
    attr_accessor :github

    def initialize(github)
      @github = github
    end

    def board(user_name, repo)
      issues = github.get_issues(user_name, repo)
      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      all_labels = github.labels(user_name, repo)
      all_labels = all_labels.map do |label|
        x = issues_by_label[label[:name]]
        label[:issues] = x || []
        label
      end
      {
        labels: all_labels
      }
    end

    def create_hook(user_name, repo, token)
      params = {
        name:"web",
        config: {
            url: token
          },
        events: ["issue_comment"],
         active: true
        }
      github.create_hook user_name, repo, params
    end

    def all_repos
       the_repos = github.repos
       github.orgs.each do |org|
         the_repos.concat(github.repos(org["login"]))
       end
       the_repos
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
