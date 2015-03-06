module Saas
  class Engine < ::Rails::Engine
    isolate_namespace Saas
    
    module DoAThing
      def do_a_thing
       return  unless params.has_key?(:user) && params.has_key?(:repo)

       repo = gh.repos(params[:user], params[:repo]).raw

       not_found unless repo.status == 200

       if github_authenticated?(:private) && repo.body["private"]
         UseCase::PrivateRepo.new(gh, couch).run(params).match do
           success do
              session[:forward_to] = "/#{params[:user]}/#{params[:repo]}"
              return redirect_to "/settings/#{params[:user]}/trial" if params[:trial_available]

              user = gh.users(params[:user])
              session[:github_login] = user['login']
           end
            failure :pass_through do
              return;
            end

            failure :unauthorized do
              throw :warden, message:"Nope"
            end
         end
       end

       # is repo private?
       #  do they have an account...
      end
    end


    initializer "saas.test" do
      ActiveSupport.on_load :action_controller do
        include DoAThing
        before_action :do_a_thing
      end
    end
  end
end
