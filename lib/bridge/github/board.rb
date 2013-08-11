class Huboard
  class Board

    attr_accessor :user, :repo, :connection_factory

    def initialize(user, repo, client)
      @gh = client.call
      @connection_factory = client
      @user = user
      @repo = repo
    end

    def gh
      @gh.repos(user, repo)
    end

    def backlog_column
       grouped = issues.group_by {|i| i["current_state"]["name"] }
       first = column_labels.first 
       issues =  (grouped["__nil__"] || []).concat(grouped[first.name]|| [])
       return {
         :index => first[:index],
         :issues => issues.sort_by {|i| i.order }
       }
    end

    def has_board?
      gh.raw.status == 200 && column_labels.size > 0
    end

    def board
       settings = self.settings
       columns = column_labels.drop(settings[:show_all] ? 1 : 0)
       issues = columns.map { |c| issues(c.name) }.flat_map {|i| i }
       grouped = issues.group_by {|i| i["current_state"]["name"] }
       columns = column_labels.each_with_index do |label, index|
         label["issues"] = (grouped[label.name] || [])
         label
       end


      return {
        :labels => columns,
        :milestones => milestones,
        :other_labels => other_labels,
        :assignees => assignees.to_a
      }
    end

    def merge(target, other, label)
       return target unless target[:labels].size == other[:labels].size

       target[:labels].each_with_index do |l, i|
         linked = other[:labels][i][:issues].map do |issue|
           issue["repo"][:color] = label.color
           issue
         end 
         l[:issues] = l[:issues].concat(linked).sort_by { |issue| issue.order }
       end
       
       milestones = other[:milestones].reject {|m| target[:milestones].any? { |o| o.title == m.title }}
       target[:milestones] = target[:milestones].concat(milestones).sort_by { |m| m["_data"]["order"] || m["number"].to_f }

       labels = other[:other_labels].reject {|m| target[:other_labels].any? { |o| o.name == m.name }}
       target[:other_labels] = target[:other_labels].concat(labels)

       return target
    end

  end
end
