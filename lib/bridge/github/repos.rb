class Huboard
  module Repos
    def repos(org = nil)

      repos = org.nil? ? connection.user.repos(:type => "owner", :sort => "updated").paginate(:per_page => 100, :page => 1) : connection.orgs(org).repos(:type => "owner",:sort => "updated").paginate(:per_page => 100, :page => 1)
      repos.reject { |r| !r.has_issues }.sort_by{ |r| r["open_issues_count"] || 0 }.reverse
    end

    def all_repos
      #repos = connection.user.repos(:type => "sources", :sort => "updated").paginate(:per_page => 100, :page => 1)
      repos = connection.user.repos(:type => "owner", :sort => "updated").all
      #repos.concat(connection.user.repos(:type => "owner", :sort => "updated").paginate(:per_page => 100, :page => 1))
      return repos.reject { |r| !r.has_issues }.sort_by{ |r| r["open_issues_count"] || 0 }.reverse
    end

    def repos_by_user(username)
      user = connection.users username
      the_repos = repos(user.login) if user.type == "Organization"
      the_repos = connection.users(username).repos.paginate(:per_page => 100, :page => 1) if user.type == "User"
      (the_repos || []).sort_by{ |r| r["open_issues_count"] || 0 }.reverse
    end
  end

  class Client
    include Repos
  end
end
