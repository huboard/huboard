module HuBoard
  module Routes
    module Api
      class User < Base
        get '/api/user' do
          json(
            #orgs: gh.orgs.to_a,
            repos: gh.user.repos(:type => "member").paginate(:per_page => 100, :page => 1).to_a,
            user: gh.user
          )
        end
      end
    end
  end
end
