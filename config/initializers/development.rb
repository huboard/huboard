module HuBoard
  module Routes
    class Repositories

      before "/:user/:repo/?*" do 

        return if RESERVED_URLS.include? params[:user]

        if authenticated? :private
          repo = gh.repos params[:user], params[:repo]

          raise Sinatra::NotFound if repo['message'] == "Not Found"

          if repo['private'] 
            private_repo = UseCase::PrivateRepo.new(gh, couch)
            private_repo.run(params).match do
              success do
                session[:forward_to] = "#{params[:user]}/#{params[:repo]}"
                redirect "/settings/#{params[:user]}/trial" if params[:trial_available]

                user = gh.users(params[:user])
                session[:github_login] = user['login']
                session[:upgrade_url] = user['login'] == gh.user['login'] ? "/settings/profile" : "/settings/profile/#/#{user['login']}"
              end

              failure :pass_through do
                return;
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

