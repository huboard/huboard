module HuBoard
  module Routes
    class Repositories

      before "/:user/:repo/?*" do 

        return if RESERVED_URLS.include? params[:user]

        if authenticated? :private
          repo = gh.repos params[:user], params[:repo]

          raise Sinatra::NotFound if repo['message'] == "Not Found"

          if repo['private'] 
            user = gh.users params[:user]
            customer = couch.customers.findPlanById user['id']

            private_repo = UseCase::PrivateRepo.new(user, gh.user, couch)
            private_repo.run(customer).match do
              success do
                session[:github_login] = user['login']
                session[:upgrade_url] = user['login'] == gh.user['login'] ? "/settings/profile" : "/settings/profile/#/#{user['login']}"
              end

              failure :unauthorized do
                throw(:warden) 
              end
            end
          end
        else
          repo = gh.repos params[:user], params[:repo]
          raise Sinatra::NotFound if repo['message'] == "Not Found"
        end
      end

    end
  end
end

