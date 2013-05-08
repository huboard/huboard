class Huboard

  module Repos

    def repos(org = nil)

      repos = org.nil? ? connection.user.repos.all : connection.orgs(org).repos.all

      repos.reject { |r| !r.has_issues }.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse

    end

    def all_repos
      the_repos = repos
      connection.orgs.each do |org|
        the_repos.concat(repos(org.login))
      end
      the_repos.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end

    def repos_by_user(user)
      user = connection.users user
      the_repos = repos(user.login) if user.type == "Organization"
      the_repos = user.repos.all.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse if user.type == "User"
      the_repos.reject { |r| !r.has_issues }.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end


  end

  class Client
      include Repos
  end

end
