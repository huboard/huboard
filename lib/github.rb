require 'httparty'
require 'crack'

module Dashboard

  class Github 
    include HTTParty
    format :json
    base_uri "https://api.github.com/repos" 



    def self.milestones(user_name = "DovetailSoftware", repo = "blue")
      response = get_issues(user_name, repo)

      reply = response.group_by { |issue| issue["milestone"] }.map do |milestone, issues|
        next if milestone.nil?

        { 
          title: milestone["title"], 
          creator: milestone["creator"],
          url: milestone["url"],
          description: milestone["description"],
          state: milestone["state"],
          number: milestone["number"],
          open_issues: milestone["open_issues"],
          closed_issues: milestone["closed_issues"],
          due_on: milestone[:due_on] || "",
          #users: issues.group_by {|x| x["user"]}.map{ |name,users|  {login: name["login"], gravatar_id: name["gravatar_id"]} },
          issues: issues 
        }
      end
      reply.sort {|a,b| a[:due_on] <=> b[:due_on]}
    end              

    def self.get_issues(user_name = "DovetailSoftware", repo = "blue")
      puts "retrieving issues"
      body = get("/#{user_name}/#{repo}/issues?milestone=*&direction=asc").body
      issues = Crack::JSON.parse(body)
      issues.each do |issue|
        issue["current_state"] = current_state(issue) 
      end
      issues
    end

    def self.current_state(issue)

      r = /(?<id>\d+) *- *(?<name>.+)/
        issue["labels"].find {|x| r.match(x["name"])}  || {"name" => "none"}

    end

    def self.board(user_name = "DovetailSoftware", repo = "blue")
      issues = get_issues(user_name, repo)

      issues_by_label = issues.group_by { |issue| issue["current_state"]["name"] }
      
      all_labels = labels(user_name, repo)

      all_labels = all_labels.map do |label|
        x = issues_by_label[label[:name]]
        label[:issues] = x || []
        label
      end

      {
        labels: all_labels
      }

    end

    def self.labels(user_name = "DovetailSoftware", repo = "blue")
      puts  "/#{user_name}/#{repo}/labels"
      body = get("/#{user_name}/#{repo}/labels").body
      response = Crack::JSON.parse(body)
      puts response

      labels = []

      response.each do |label|
        r = /(?<id>\d+) *- *(?<name>.+)/
          puts label
        hash = r.match (label["name"])

        labels << { name: label["name"], index: hash[:id], text: hash[:name], color: label["color"]} unless hash.nil?
      end

      labels.sort {|a,b| a[:id] <=> b[:id]}
    end

  end
end
