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
      @response ||= @gh.repos(user, repo)
    end

    def repo_exists?(user = nil, repo = nil)
      if user and repo
        @gh.repos(user, repo).raw.status == 200
      else
        gh.raw.status == 200
      end
    end

    def has_board?
      gh.raw.status == 200 && column_labels.size > 0
    end

    def issues_enabled?
      gh.has_issues
    end

    def enable_issues
      gh.patch(
        :name => @repo,
        :has_issues => true
      )
    end

    def linked?(user, repo)
      linked = Board.new(user, repo, @connection_factory)

      linked.column_labels.size == column_labels.size
    rescue
      false
    end

    def linked(user, repo)
      label = link_labels.find{|l| l[:user] == user && l[:repo] == repo}
      board = Board.new(user, repo, @connection_factory).meta
      board[:issues] = board[:issues].map {|i| i.merge({ color: label.color })}
      board
    end

    def meta
      gh_repos = gh
      columns = column_labels
      first_column = columns.first

      issues = issues().concat(closed_issues(columns.last.name)).map do |i|
        i[:current_state] = first_column if i[:current_state]["name"] == "__nil__"
        i[:current_state] = columns.find { |c| c[:name] == i[:current_state]["name"] }
        i
      end

      {
        "id" => gh_repos.id,
        full_name: gh_repos.full_name,
        columns: columns,
        milestones: milestones,
        other_labels: other_labels.sort_by {|l| l.name.downcase },
        link_labels: link_labels,
        assignees: assignees.to_a,
        issues: issues
      }
    end

    def create_board
      create_label :name => "0 - Backlog", :color => "CCCCCC"
      create_label :name => "1 - Ready", :color => "CCCCCC"
      create_label :name => "2 - Working", :color => "CCCCCC"
      create_label :name => "3 - Done", :color => "CCCCCC"

      create_hook
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

      target
    end
  end
end
