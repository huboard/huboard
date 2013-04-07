class Huboard

  module Repos

    def repos(org = nil)

      repos = org.nil? ? client.user.repos.all : client.orgs(org).repos.all

      repos.reject { |r| !r.has_issues }.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse

    end

    def all_repos
      the_repos = repos
      client.orgs.each do |org|
        the_repos.concat(repos(org.login))
      end
      the_repos.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end

    def repos_by_user(user)
      user = client.users user
      the_repos = repos(user.login) if user.type == "Organization"
      the_repos = user.repos.all.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse if user.type == "User"
      the_repos.reject { |r| !r.has_issues }.sort_by{|r| r["pushed_at"] || "1111111111111111"}.reverse
    end


  end

  extend Repos
end
