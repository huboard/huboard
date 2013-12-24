class Huboard

  module Repos

    def repos(org = nil)

      repos = org.nil? ? connection.user.repos.all : connection.orgs(org).repos.all

      repos.reject { |r| !r.has_issues }.sort_by{|r| r["open_issues_count"] || 0}.reverse

    end

    def all_repos
      the_repos = repos
      connection.orgs.each do |org|
        the_repos.concat(repos(org.login))
      end
      the_repos.sort_by{|r| r["open_issues_count"] || 0}.reverse
    end

    def repos_by_user(username)
      user = connection.users username
      the_repos = repos(user.login) if user.type == "Organization"
      the_repos = connection.users(username).repos.all if user.type == "User"
      (the_repos || []).sort_by{|r| r["open_issues_count"] || 0}.reverse
    end


  end

  class Client
      include Repos
  end

end
