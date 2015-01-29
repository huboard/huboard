module HuBoard
  module Routes
    class Repositories

      before "/:user/:repo/?*" do 

        return if RESERVED_URLS.include? params[:user]
        repo = gh.repos params[:user], params[:repo]
        raise Sinatra::NotFound if repo['message'] == "Not Found"

        if authenticated?(:private) && repo["private"]
          private_repo = UseCase::PrivateRepo.new(gh, couch)

          private_repo.run(params).match do
            success do
              session[:forward_to] = "#{params[:user]}/#{params[:repo]}"
              redirect "/settings/#{params[:user]}/trial" if params[:trial_available]

              user = gh.users(params[:user])
              session[:github_login] = user['login']
              session[:upgrade_url] = "/settings/profile"
            end

            failure :pass_through do
              return;
            end

            failure :unauthorized do
              throw(:warden) 
            end
          end
        end
      end
    end
  end
end

